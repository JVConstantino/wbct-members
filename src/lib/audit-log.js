import { db, DB_ID, COLS, ID } from "@/lib/appwrite";

/**
 * Records an admin action for LGPD security audit trail.
 * Requires the "admin_audit_log" collection in Appwrite with fields:
 * adminId (string), action (string), targetType (string), targetId (string), details (string), createdAt (string)
 */
export async function createAuditLog(adminId, action, targetType, targetId, details = {}) {
    try {
        await db.createDocument(DB_ID, COLS.adminAuditLog, ID.unique(), {
            adminId: adminId || "unknown",
            action,
            targetType: targetType || "",
            targetId: targetId || "",
            details: JSON.stringify(details),
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Audit log write failed:", error);
    }
}
