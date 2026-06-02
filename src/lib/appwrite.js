import { Client, Databases, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const db = new Databases(client);
export const DB_ID = process.env.APPWRITE_DATABASE_ID;
export { ID, Query };

export const COLS = {
  users: "users",
  posts: "posts",
  comments: "comments",
  events: "events",
  webinars: "webinars",
  courses: "courses",
  lessons: "lessons",
  lessonAttachments: "lesson_attachments",
  lessonProgress: "lesson_progress",
  messages: "messages",
  notifications: "notifications",
  userActivities: "user_activities",
  follows: "follows",
  userEvents: "user_events",
  connections: "connections",
  consentLog: "consent_log",
  appSettings: "app_settings",
  eventParticipants: "event_participant_status",
};

// Fetch all pages of a collection (Appwrite caps at 25 per page by default)
export async function listAll(collectionId, queries = []) {
  const results = [];
  let cursor = null;
  const limit = 100;

  while (true) {
    const q = [Query.limit(limit), ...queries];
    if (cursor) q.push(Query.cursorAfter(cursor));

    const res = await db.listDocuments(DB_ID, collectionId, q);
    results.push(...res.documents);

    if (res.documents.length < limit) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }

  return results;
}
