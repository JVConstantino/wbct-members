import fs from "node:fs";
import path from "node:path";

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

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT.replace(/\/$/, "");
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

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

async function ensureCollection(collectionId, name) {
  try {
    await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}`);
    return { created: false };
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
  return { created: true };
}

async function listAttributes(collectionId) {
  const query = encodeURIComponent(JSON.stringify({ method: "limit", values: [100] }));
  const data = await appwriteRequest(
    "GET",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes?queries[]=${query}`
  );
  return data.attributes || [];
}

async function ensureStringAttribute(collectionId, { key, size, required = false, default: defaultValue }) {
  const attrs = await listAttributes(collectionId);
  if (attrs.some((a) => a.key === key)) return { created: false };

  const body = {
    key,
    size,
    required,
    array: false,
  };
  if (defaultValue !== undefined) body.default = defaultValue;

  await appwriteRequest(
    "POST",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/string`,
    body
  );
  return { created: true };
}

async function ensureBooleanAttribute(collectionId, { key, required = false, default: defaultValue }) {
  const attrs = await listAttributes(collectionId);
  if (attrs.some((a) => a.key === key)) return { created: false };

  const body = { key, required };
  if (defaultValue !== undefined) body.default = defaultValue;

  await appwriteRequest(
    "POST",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/boolean`,
    body
  );
  return { created: true };
}

async function waitAttributesAvailable(collectionId, keys) {
  for (let i = 0; i < 30; i += 1) {
    const attrs = await listAttributes(collectionId);
    const pending = attrs.filter((a) => keys.includes(a.key) && a.status !== "available");
    if (pending.length === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

const summary = {
  users: { collectionExists: false, attributes: [] },
  posts: { collectionExists: false, attributes: [] },
  postCategories: { collectionExists: false, attributes: [] },
  userEvents: { collectionExists: false, attributes: [] },
  eventParticipantStatus: { collectionExists: false, attributes: [] },
};

async function migrateUsers() {
  console.log("\n[users] provisioning attributes");
  try {
    await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/users`);
    summary.users.collectionExists = true;
  } catch (error) {
    if (error.status !== 404) throw error;
    throw new Error("Collection 'users' not found. Run provision-appwrite-from-mysql.mjs first.");
  }

  const userAttrs = [
    { key: "applicationType", size: 32, required: false, default: "MEMBER" },
    { key: "rejectionReason", size: 2000, required: false },
    { key: "applicationDocuments", size: 4000, required: false },
  ];

  for (const a of userAttrs) {
    const { created } = await ensureStringAttribute("users", a);
    summary.users.attributes.push({ key: a.key, created });
    console.log(`  - ${a.key}: ${created ? "created" : "skipped (exists)"}`);
  }

  const { created: newsletterCreated } = await ensureBooleanAttribute("users", {
    key: "emailNewsletter",
    required: false,
    default: false,
  });
  summary.users.attributes.push({ key: "emailNewsletter", created: newsletterCreated });
  console.log(`  - emailNewsletter: ${newsletterCreated ? "created" : "skipped (exists)"}`);

  await waitAttributesAvailable(
    "users",
    [...userAttrs.map((a) => a.key), "emailNewsletter"]
  );
}

async function migratePosts() {
  console.log("\n[posts] provisioning attributes");
  try {
    await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/posts`);
    summary.posts.collectionExists = true;
  } catch (error) {
    if (error.status !== 404) throw error;
    throw new Error("Collection 'posts' not found. Run provision-appwrite-from-mysql.mjs first.");
  }

  const { created } = await ensureStringAttribute("posts", {
    key: "categoryId",
    size: 64,
    required: false,
  });
  summary.posts.attributes.push({ key: "categoryId", created });
  console.log(`  - categoryId: ${created ? "created" : "skipped (exists)"}`);

  await waitAttributesAvailable("posts", ["categoryId"]);
}

async function migrateEventFollows() {
  console.log("\n[user_events] provisioning attributes");
  try {
    await appwriteRequest("GET", `/databases/${APPWRITE_DATABASE_ID}/collections/user_events`);
    summary.userEvents.collectionExists = true;
  } catch (error) {
    if (error.status !== 404) throw error;
    throw new Error("Collection 'user_events' not found.");
  }

  // The collection was originally provisioned as a Prisma implicit join
  // table (columns "A"/"B") instead of the named attributes the app code
  // queries against (userId/eventId). Add the attributes the app expects;
  // the collection has no documents yet so nothing needs backfilling.
  const ueAttrs = [
    { key: "userId", size: 64, required: false },
    { key: "eventId", size: 64, required: false },
    { key: "createdAt", size: 64, required: false },
  ];
  for (const a of ueAttrs) {
    const { created } = await ensureStringAttribute("user_events", a);
    summary.userEvents.attributes.push({ key: a.key, created });
    console.log(`  - ${a.key}: ${created ? "created" : "skipped (exists)"}`);
  }
  await waitAttributesAvailable("user_events", ueAttrs.map((a) => a.key));

  console.log("\n[event_participant_status] provisioning collection + attributes");
  const { created: collCreated } = await ensureCollection("event_participant_status", "Event Participant Status");
  summary.eventParticipantStatus.collectionExists = true;
  console.log(`  - collection 'event_participant_status': ${collCreated ? "created" : "skipped (exists)"}`);

  const epsAttrs = [
    { key: "eventId", size: 64, required: false },
    { key: "userId", size: 64, required: false },
    { key: "status", size: 32, required: false },
    { key: "updatedAt", size: 64, required: false },
  ];
  for (const a of epsAttrs) {
    const { created } = await ensureStringAttribute("event_participant_status", a);
    summary.eventParticipantStatus.attributes.push({ key: a.key, created });
    console.log(`  - ${a.key}: ${created ? "created" : "skipped (exists)"}`);
  }
  await waitAttributesAvailable("event_participant_status", epsAttrs.map((a) => a.key));
}

async function migratePostCategories() {
  console.log("\n[post_categories] provisioning collection + attributes");
  const { created: collCreated } = await ensureCollection("post_categories", "Post Categories");
  summary.postCategories.collectionExists = true;
  console.log(`  - collection 'post_categories': ${collCreated ? "created" : "skipped (exists)"}`);

  const catAttrs = [
    { key: "name", size: 200, required: true },
    { key: "slug", size: 200, required: true },
    { key: "createdAt", size: 64, required: true },
    { key: "createdBy", size: 64, required: false },
  ];

  for (const a of catAttrs) {
    const { created } = await ensureStringAttribute("post_categories", a);
    summary.postCategories.attributes.push({ key: a.key, created });
    console.log(`  - ${a.key}: ${created ? "created" : "skipped (exists)"}`);
  }

  await waitAttributesAvailable(
    "post_categories",
    catAttrs.map((a) => a.key)
  );
}

async function main() {
  console.log("Appwrite migration: application fields + post_categories");
  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Database: ${APPWRITE_DATABASE_ID}`);

  await migrateUsers();
  await migratePosts();
  await migrateEventFollows();
  await migratePostCategories();

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nDone. After attributes are available, run:");
  console.log("  node scripts/seed-post-categories.mjs");
  console.log("to seed the initial post categories.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
