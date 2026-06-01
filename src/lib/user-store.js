import { isDatabaseConfigured, query as mysqlQuery } from "@/lib/db";
import {
  COLLECTIONS,
  createDocument,
  hasAppwriteConfig,
  listDocuments,
  Query,
  updateDocument,
} from "@/lib/appwrite-db";

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
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getUserByEmailFromMySQL(email) {
  const users = await mysqlQuery(
    "SELECT id, name, email, password, role, status, bio, specialty, crm, image, lastActiveAt FROM User WHERE email = ?",
    [email]
  );
  return users[0] || null;
}

async function getUserByEmailFromAppwrite(email) {
  const result = await listDocuments(COLLECTIONS.users, [
    Query.equal("email", email),
    Query.limit(1),
  ]);
  const doc = result.documents?.[0];
  return doc ? mapUserDocument(doc) : null;
}

export async function getUserByEmail(email) {
  if (USE_APPWRITE) {
    try {
      return await getUserByEmailFromAppwrite(email);
    } catch (error) {
      console.error("Appwrite getUserByEmail failed:", error.message);
      if (isDatabaseConfigured()) {
        return getUserByEmailFromMySQL(email);
      }
      throw error;
    }
  }
  return getUserByEmailFromMySQL(email);
}

export async function createPendingUser(data) {
  const id = `user_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  if (USE_APPWRITE) {
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
        createdAt: now,
        updatedAt: now,
        lastActiveAt: null,
      });
      return id;
    } catch (error) {
      console.error("Appwrite createPendingUser failed:", error.message);
      if (!isDatabaseConfigured()) throw error;
    }
  }

  await mysqlQuery(
    `INSERT INTO User (id, name, email, password, bio, specialty, crm, image, role, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBER', 'PENDING', NOW(), NOW())`,
    [id, data.name, data.email, data.password, data.bio || "", data.specialty || "", data.crm || "", data.image || null]
  );

  return id;
}

export async function updateLastActiveAt(userId) {
  if (USE_APPWRITE) {
    try {
      await updateDocument(COLLECTIONS.users, userId, {
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch (error) {
      console.error("Appwrite updateLastActiveAt failed:", error.message);
      if (!isDatabaseConfigured()) return;
    }
  }

  await mysqlQuery("UPDATE User SET lastActiveAt = NOW() WHERE id = ?", [userId]);
}

export async function createLoginActivity(userId) {
  const activityId = `login_${String(userId).slice(0, 8)}_${Date.now().toString(36)}`;

  if (USE_APPWRITE) {
    try {
      await createDocument(COLLECTIONS.userActivities, activityId, {
        userId,
        type: "LOGIN",
        createdAt: new Date().toISOString(),
      });
      return;
    } catch (error) {
      console.error("Appwrite createLoginActivity failed:", error.message);
      if (!isDatabaseConfigured()) return;
    }
  }

  await mysqlQuery(
    "INSERT INTO UserActivity (id, userId, type, createdAt) VALUES (?, ?, ?, NOW())",
    [activityId, userId, "LOGIN"]
  );
}
