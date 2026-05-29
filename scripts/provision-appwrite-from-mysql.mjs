import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

function loadEnvFile(filePath = ".env") {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) return;
  const lines = fs.readFileSync(absPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const REQUIRED_ENV = ["DATABASE_URL", "APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY", "APPWRITE_DATABASE_ID"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT.replace(/\/$/, "");
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

const COLLECTION_MAP = {
  User: "users",
  Post: "posts",
  Comment: "comments",
  Event: "events",
  Webinar: "webinars",
  Course: "courses",
  Lesson: "lessons",
  LessonAttachment: "lesson_attachments",
  LessonProgress: "lesson_progress",
  Message: "messages",
  Notification: "notifications",
  UserActivity: "user_activities",
  Follows: "follows",
  _UserEvents: "user_events",
};

async function appwriteRequest(method, route, body) {
  const response = await fetch(`${APPWRITE_ENDPOINT}${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": APPWRITE_PROJECT_ID,
      "X-Appwrite-Key": APPWRITE_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const err = new Error(`Appwrite API error ${response.status}: ${data?.message || text}`);
    err.status = response.status;
    throw err;
  }
  return data;
}

function parseType(col) {
  const type = col.COLUMN_TYPE.toLowerCase();
  const dataType = col.DATA_TYPE.toLowerCase();
  if (dataType === "datetime" || dataType === "timestamp" || dataType === "date") return { kind: "datetime" };
  if (dataType === "tinyint" && String(col.NUMERIC_PRECISION || "") === "1") return { kind: "boolean" };
  if (["int", "bigint", "smallint", "mediumint", "tinyint"].includes(dataType)) return { kind: "integer" };
  if (["float", "double", "decimal"].includes(dataType)) return { kind: "float" };
  if (dataType === "enum") {
    const values = type
      .replace(/^enum\(/, "")
      .replace(/\)$/, "")
      .split(",")
      .map((v) => v.trim().replace(/^'/, "").replace(/'$/, ""));
    const maxLen = Math.max(1, ...values.map((v) => v.length));
    return { kind: "string", size: Math.min(65535, Math.max(maxLen, 32)) };
  }
  const len = Number(col.CHARACTER_MAXIMUM_LENGTH || 255);
  return { kind: "string", size: Math.min(65535, Math.max(len, 32)) };
}

async function ensureCollection(collectionId, name) {
  try {
    await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}`);
    return;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections`, {
    collectionId,
    name,
    permissions: [],
    documentSecurity: false,
    enabled: true,
  });
}

async function listAttributes(collectionId) {
  const data = await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes`);
  return data.attributes || [];
}

async function ensureAttribute(collectionId, col) {
  if (col.COLUMN_NAME === "id") return;
  const existing = await listAttributes(collectionId);
  if (existing.some((a) => a.key === col.COLUMN_NAME)) return;

  const t = parseType(col);
  const required = col.IS_NULLABLE === "NO";
  const key = col.COLUMN_NAME;

  if (t.kind === "string") {
    await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/string`, {
      key,
      size: t.size,
      required,
      array: false,
    });
    return;
  }

  if (t.kind === "integer") {
    await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/integer`, {
      key,
      required,
      array: false,
    });
    return;
  }

  if (t.kind === "float") {
    await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/float`, {
      key,
      required,
      array: false,
    });
    return;
  }

  if (t.kind === "boolean") {
    await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/boolean`, {
      key,
      required,
      array: false,
    });
    return;
  }

  if (t.kind === "datetime") {
    await appwriteRequest("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/datetime`, {
      key,
      required,
      array: false,
    });
  }
}

async function waitAttributesAvailable(collectionId, keys) {
  for (let i = 0; i < 30; i += 1) {
    const attrs = await listAttributes(collectionId);
    const pending = attrs.filter((a) => keys.includes(a.key) && a.status !== "available");
    if (pending.length === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    for (const [table, collectionId] of Object.entries(COLLECTION_MAP)) {
      console.log(`\n[${table}] provisioning -> ${collectionId}`);
      await ensureCollection(collectionId, table);

      const [columns] = await connection.query(
        `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [table]
      );

      const keys = [];
      for (const col of columns) {
        if (col.COLUMN_NAME === "id") continue;
        await ensureAttribute(collectionId, col);
        keys.push(col.COLUMN_NAME);
      }

      await waitAttributesAvailable(collectionId, keys);
      console.log(`[${table}] ok`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Provision failed:", err.message);
  process.exit(1);
});
