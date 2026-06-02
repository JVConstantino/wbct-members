import { db, DB_ID, COLS, ID, Query } from "@/lib/appwrite";

function mapDoc(doc) {
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

export async function getUserByEmail(email) {
  const res = await db.listDocuments(DB_ID, COLS.users, [
    Query.equal("email", email),
    Query.limit(1),
  ]);
  const doc = res.documents[0];
  return doc ? mapDoc(doc) : null;
}

export async function createPendingUser(data) {
  const id = `user_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  await db.createDocument(DB_ID, COLS.users, id, {
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
}

export async function updateLastActiveAt(userId) {
  const now = new Date().toISOString();
  await db.updateDocument(DB_ID, COLS.users, userId, {
    lastActiveAt: now,
    updatedAt: now,
  });
}

export async function createLoginActivity(userId) {
  const activityId = `login_${String(userId).slice(0, 8)}_${Date.now().toString(36)}`;
  await db.createDocument(DB_ID, COLS.userActivities, activityId, {
    userId,
    type: "LOGIN",
    createdAt: new Date().toISOString(),
  });
}
