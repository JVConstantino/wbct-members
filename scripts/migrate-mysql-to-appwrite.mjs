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
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const REQUIRED_ENV = [
  "DATABASE_URL",
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
];

for (const name of REQUIRED_ENV) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT.replace(/\/$/, "");
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const BATCH_SIZE = Number(process.env.MIGRATION_BATCH_SIZE || "300");

const COLLECTION_MAP = process.env.APPWRITE_COLLECTIONS_JSON
  ? JSON.parse(process.env.APPWRITE_COLLECTIONS_JSON)
  : {
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

const MIGRATION_PLAN = [
  { table: "User", idFrom: (r) => r.id },
  { table: "Course", idFrom: (r) => r.id },
  { table: "Lesson", idFrom: (r) => r.id },
  { table: "LessonAttachment", idFrom: (r) => r.id },
  { table: "Event", idFrom: (r) => r.id },
  { table: "Webinar", idFrom: (r) => r.id },
  { table: "Post", idFrom: (r) => r.id },
  { table: "Comment", idFrom: (r) => r.id },
  { table: "Follows", idFrom: (r) => `${r.followerId}_${r.followingId}` },
  { table: "_UserEvents", idFrom: (r) => `${r.A}_${r.B}` },
  { table: "Message", idFrom: (r) => r.id },
  { table: "Notification", idFrom: (r) => r.id },
  { table: "LessonProgress", idFrom: (r) => r.id },
  { table: "UserActivity", idFrom: (r) => r.id },
];

function normalizeValue(value) {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return Number(value);
  return value;
}

function normalizeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "id") continue;
    out[k] = normalizeValue(v);
  }
  return out;
}

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

const attributeCache = new Map();

async function getCollectionAttributes(collectionId) {
  if (attributeCache.has(collectionId)) return attributeCache.get(collectionId);
  const data = await appwriteRequest(
    "GET",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes`
  );
  const map = new Map();
  for (const a of data.attributes || []) {
    map.set(a.key, a);
  }
  attributeCache.set(collectionId, map);
  return map;
}

function fitValueToAttribute(value, attr) {
  if (value === null || value === undefined) return null;
  if (!attr) return value;

  if (attr.type === "string") {
    const raw = typeof value === "string" ? value : String(value);
    if (typeof attr.size === "number" && raw.length > attr.size) {
      return raw.slice(0, attr.size);
    }
    return raw;
  }

  if (attr.type === "integer") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  if (attr.type === "double") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  if (attr.type === "boolean") {
    return Boolean(value);
  }

  if (attr.type === "datetime") {
    if (value instanceof Date) return value.toISOString();
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  return value;
}

async function upsertDocument(collectionId, documentId, data) {
  const createRoute = `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`;
  try {
    await appwriteRequest("POST", createRoute, {
      documentId,
      data,
    });
    return "created";
  } catch (error) {
    if (error.status !== 409) throw error;
    const updateRoute = `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`;
    await appwriteRequest("PATCH", updateRoute, { data });
    return "updated";
  }
}

async function migrateTable(connection, plan) {
  const collectionId = COLLECTION_MAP[plan.table];
  if (!collectionId) {
    throw new Error(`Missing collection mapping for table ${plan.table}`);
  }

  const [countRows] = await connection.query(`SELECT COUNT(*) as total FROM ${plan.table}`);
  const total = Number(countRows[0]?.total || 0);
  console.log(`\n[${plan.table}] ${total} rows -> collection '${collectionId}'`);

  let offset = 0;
  let created = 0;
  let updated = 0;
  const attrs = await getCollectionAttributes(collectionId);

  while (offset < total) {
    const [rows] = await connection.query(
      `SELECT * FROM ${plan.table} LIMIT ? OFFSET ?`,
      [BATCH_SIZE, offset]
    );

    for (const row of rows) {
      const documentId = plan.idFrom(row);
      const data = normalizeRow(row);
      const fitted = {};
      for (const [k, v] of Object.entries(data)) {
        fitted[k] = fitValueToAttribute(v, attrs.get(k));
      }
      const action = await upsertDocument(collectionId, documentId, fitted);
      if (action === "created") created += 1;
      if (action === "updated") updated += 1;
    }

    offset += rows.length;
    console.log(`[${plan.table}] migrated ${offset}/${total}`);
    if (rows.length === 0) break;
  }

  console.log(`[${plan.table}] done. created=${created}, updated=${updated}`);
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    console.log("Starting MySQL -> Appwrite migration (staging mode)");
    console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
    console.log(`Database: ${APPWRITE_DATABASE_ID}`);

    for (const plan of MIGRATION_PLAN) {
      await migrateTable(connection, plan);
    }

    console.log("\nMigration finished successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
