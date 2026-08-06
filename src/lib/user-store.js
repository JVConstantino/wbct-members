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
    applicationType: doc.applicationType,
    applicationDocuments: doc.applicationDocuments,
    rejectionReason: doc.rejectionReason,
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

  const doc = {
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
  };

  if (data.emailNewsletter !== undefined) {
    doc.emailNewsletter = data.emailNewsletter;
  }

  // Phase 2 fields — written optimistically. The Appwrite attributes
  // applicationType / applicationDocuments are provisioned by
  // scripts/migrate-application-and-categories.mjs. If those attributes
  // don't exist yet in a given environment, Appwrite will reject the
  // createDocument call. We try, and on failure fall back to a minimal
  // create so the registration still works (no documents persisted,
  // but the account is still created and the admin can review).
  const wantsApplicationType =
    data.applicationType === "MEMBER" || data.applicationType === "ACADEMIC_AFFILIATE";
  const hasApplicationDocuments =
    data.applicationDocuments &&
    typeof data.applicationDocuments === "object" &&
    Object.keys(data.applicationDocuments).length > 0;

  if (wantsApplicationType) doc.applicationType = data.applicationType;
  if (hasApplicationDocuments) {
    try {
      doc.applicationDocuments = JSON.stringify(data.applicationDocuments);
    } catch {
      // ignore serialization errors, just skip
    }
  }

  // Retry without unrecognized attributes so registration still succeeds
  // even before a migration has run against a given Appwrite environment.
  let fallback = { ...doc };
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await db.createDocument(DB_ID, COLS.users, id, fallback);
      return id;
    } catch (error) {
      const msg = String(error?.message || "");
      const unknownAttrMatch = msg.match(/Unknown attribute:?\s*"?([a-zA-Z0-9_]+)"?/);
      if (unknownAttrMatch && unknownAttrMatch[1] in fallback) {
        delete fallback[unknownAttrMatch[1]];
        continue;
      }
      throw error;
    }
  }
  throw new Error("Could not create user document after removing unrecognized attributes.");
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
