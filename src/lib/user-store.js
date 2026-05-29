import { query as mysqlQuery } from "@/lib/db";
import { COLLECTIONS, createDocument, hasAppwriteConfig, listDocuments, updateDocument } from "@/lib/appwrite-db";

const USE_APPWRITE = process.env.USE_APPWRITE_DB === "1" || hasAppwriteConfig;

function mapUserDocument(doc) {
  return {
    id: doc.$id,
    name: doc.name,
    email: doc.email,
    password: doc.password,
    role: doc.role,
    status: doc.status,
    bio: doc.bio,
    specialty: doc.specialty,
    crm: doc.crm,
    image: doc.image,
    lastActiveAt: doc.lastActiveAt,
  };
}

export async function getUserByEmail(email) {
  const users = await mysqlQuery(
    "SELECT id, name, email, password, role, status, bio, specialty, crm, image, lastActiveAt FROM User WHERE email = ?",
    [email]
  );
  if (users[0]) return users[0];

  if (!USE_APPWRITE) return null;

  const result = await listDocuments(COLLECTIONS.users);
  if (!result.documents?.length) return null;
  const doc = result.documents.find((item) => item.email === email);
  return doc ? mapUserDocument(doc) : null;
}

export async function createPendingUser(data) {
  const id = `user_${Date.now().toString(36)}`;

  await mysqlQuery(
    `INSERT INTO User (id, name, email, password, bio, specialty, crm, image, role, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBER', 'PENDING', NOW(), NOW())`,
    [id, data.name, data.email, data.password, data.bio || "", data.specialty || "", data.crm || "", data.image || null]
  );

  if (!USE_APPWRITE) return id;

  try {
    await createDocument(COLLECTIONS.users, id, {
      name: data.name,
      email: data.email,
      password: data.password,
      bio: data.bio || "",
      specialty: data.specialty || "",
      crm: data.crm || "",
      image: data.image || "",
      role: "MEMBER",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: null,
    });
  } catch (error) {
    console.error("Appwrite mirror createPendingUser failed:", error.message);
  }

  return id;
}

export async function updateLastActiveAt(userId) {
  await mysqlQuery("UPDATE User SET lastActiveAt = NOW() WHERE id = ?", [userId]);

  if (!USE_APPWRITE) return;
  try {
    await updateDocument(COLLECTIONS.users, userId, {
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Appwrite mirror updateLastActiveAt failed:", error.message);
  }
}

export async function createLoginActivity(userId) {
  const activityId = `login_${String(userId).slice(0, 8)}_${Date.now().toString(36)}`;
  await mysqlQuery("INSERT INTO UserActivity (id, userId, type, createdAt) VALUES (?, ?, ?, NOW())", [
    activityId,
    userId,
    "LOGIN",
  ]);

  if (!USE_APPWRITE) return;
  try {
    await createDocument(COLLECTIONS.userActivities, activityId, {
      userId,
      type: "LOGIN",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Appwrite mirror createLoginActivity failed:", error.message);
  }
}
