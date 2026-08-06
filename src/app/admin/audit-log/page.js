"use client";

import { useState, useEffect } from "react";
import { Shield, RefreshCw, User, Trash2, Check, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Skeleton";

const ACTION_LABELS = {
    user_approved:  { label: "Approved",       variant: "success" },
    user_rejected:  { label: "Rejected",        variant: "error"   },
    user_updated:   { label: "Updated",         variant: "info"    },
    user_created:   { label: "Created",         variant: "info"    },
    user_deleted:   { label: "Deleted",         variant: "error"   },
};

function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function ActionBadge({ action }) {
    const meta = ACTION_LABELS[action] || { label: action, variant: "neutral" };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/audit-log");
            const data = await res.json();
            if (data.success) setLogs(data.logs);
            else setError(data.error || "Could not load audit logs.");
        } catch {
            setError("Connection error. Make sure the admin_audit_log collection exists in Appwrite.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    return (
        <div className="space-y-6 pb-8">
            <PageHeader
                title="Security Audit Log"
                subtitle="Record of administrative actions on user data"
                actions={
                    <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2 text-sm">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                }
            />

            {error && (
                <div className="p-4 rounded-lg bg-status-error-bg border border-status-error/20 text-status-error text-sm flex items-start gap-2">
                    <Shield size={16} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Audit log unavailable</p>
                        <p className="text-xs mt-1">{error}</p>
                        <p className="text-xs mt-1 text-text-muted">
                            Create a collection named <code className="bg-surface-subtle px-1 rounded">admin_audit_log</code> in Appwrite
                            with string fields: adminId, action, targetType, targetId, details, createdAt.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : !error && logs.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-sm">No audit log entries found.</div>
            ) : (
                <div className="bg-surface-card rounded-lg border border-border-default shadow-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-subtle border-b border-border-default">
                            <tr>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Admin</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Action</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Target</th>
                                <th className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-surface-subtle transition-colors">
                                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{fmtDate(log.createdAt)}</td>
                                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{log.adminId}</td>
                                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                                    <td className="px-4 py-3 text-xs text-text-secondary">
                                        <span className="font-medium">{log.targetType}</span>
                                        {log.targetId && <span className="text-text-muted ml-1 font-mono">#{log.targetId.slice(0, 12)}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-text-muted font-mono">
                                        {log.details || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
