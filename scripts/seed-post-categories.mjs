import fs from "node:fs";
import path from "node:path";
import { Client, Databases, ID, Query } from "node-appwrite";

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

const REQUIRED_ENV = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = process.env.APPWRITE_DATABASE_ID;
const COL_POST_CATEGORIES = "post_categories";

const POST_CATEGORY_SEED = [
  "Foot & Ankle Surgery",
  "Knee Surgery",
  "Orthopedics",
  "Sports Medicine",
  "Trauma",
  "Biomechanics",
  "Case Reports",
  "Clinical Research",
  "Reviews",
  "Other",
];

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || `category-${Date.now().toString(36)}`;
}

async function findCategoryBySlug(slug) {
  const res = await db.listDocuments(DB_ID, COL_POST_CATEGORIES, [
    Query.equal("slug", slug),
    Query.limit(1),
  ]);
  return res.documents[0] || null;
}

async function main() {
  console.log(`Seeding post categories into '${COL_POST_CATEGORIES}'...`);

  let created = 0;
  let skipped = 0;

  for (const name of POST_CATEGORY_SEED) {
    const slug = slugify(name);
    const existing = await findCategoryBySlug(slug);
    if (existing) {
      console.log(`  - ${name} (slug: ${slug}): skipped (exists)`);
      skipped += 1;
      continue;
    }

    const now = new Date().toISOString();
    await db.createDocument(DB_ID, COL_POST_CATEGORIES, ID.unique(), {
      name,
      slug,
      createdAt: now,
      createdBy: "",
    });
    console.log(`  - ${name} (slug: ${slug}): created`);
    created += 1;
  }

  console.log(`\nDone. created=${created}, skipped=${skipped}`);
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
