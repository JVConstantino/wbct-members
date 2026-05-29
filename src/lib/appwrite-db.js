const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT?.replace(/\/$/, "");
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

export const hasAppwriteConfig = Boolean(
  APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID && APPWRITE_API_KEY && APPWRITE_DATABASE_ID
);

const COLLECTIONS = {
  users: "users",
  userActivities: "user_activities",
};

function asQueryParam(queries = []) {
  const params = new URLSearchParams();
  for (const q of queries) params.append("queries[]", q);
  return params.toString();
}

function buildUrl(route, queries) {
  const qs = queries?.length ? `?${asQueryParam(queries)}` : "";
  return `${APPWRITE_ENDPOINT}${route}${qs}`;
}

async function request(method, route, { body, queries } = {}) {
  if (!hasAppwriteConfig) {
    throw new Error("Appwrite is not configured.");
  }

  const response = await fetch(buildUrl(route, queries), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": APPWRITE_PROJECT_ID,
      "X-Appwrite-Key": APPWRITE_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || `Appwrite request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export class Query {
  static equal(field, values) {
    return `equal("${field}", ${JSON.stringify(values)})`;
  }
  static limit(value) {
    return `limit(${Number(value)})`;
  }
}

export async function listDocuments(collectionId, queries = []) {
  return request(
    "GET",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`,
    { queries }
  );
}

export async function createDocument(collectionId, documentId, data) {
  return request("POST", `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`, {
    body: { documentId, data },
  });
}

export async function updateDocument(collectionId, documentId, data) {
  return request(
    "PATCH",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
    { body: { data } }
  );
}

export async function deleteDocument(collectionId, documentId) {
  return request(
    "DELETE",
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`
  );
}

export { COLLECTIONS };
