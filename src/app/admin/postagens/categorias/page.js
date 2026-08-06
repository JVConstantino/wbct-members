"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Trash2, AlertCircle, ChevronLeft, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Skeleton";

function fmtDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PostCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/admin/post-categories");
            const data = await res.json();
            if (data.success) setCategories(data.categories);
            else setError(data.error || "Failed to load categories");
        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim() || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/admin/post-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setName("");
                setCategories((prev) => {
                    const next = [...prev, data.category];
                    next.sort((a, b) => a.name.localeCompare(b.name));
                    return next;
                });
            } else {
                setError(data.error || "Failed to create category");
            }
        } catch {
            setError("Connection error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (cat) => {
        if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
        setDeletingId(cat.id);
        setError("");
        try {
            const res = await fetch(`/api/admin/post-categories/${cat.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setCategories((prev) => prev.filter((c) => c.id !== cat.id));
            } else {
                setError(data.error || "Failed to delete category");
            }
        } catch {
            setError("Connection error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <Link
                    href="/admin/posts"
                    className="flex items-center gap-1.5 text-text-muted text-xs font-semibold hover:text-brand-primary transition-colors group mb-3"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Posts
                </Link>
                <PageHeader
                    title="Post Categories"
                    subtitle="Organize posts by medical specialty or topic"
                />
            </div>

            {error && (
                <div className="bg-status-error-bg border border-status-error/20 text-status-error px-3 py-2 rounded-md text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* Create form */}
            <form
                onSubmit={handleCreate}
                className="card p-5 flex flex-col sm:flex-row gap-3 sm:items-end"
            >
                <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={13} /> New category
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. Foot & Ankle Surgery"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={200}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className="btn-primary text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    {submitting ? <Spinner size="sm" /> : <><Plus size={14} /> Add category</>}
                </button>
            </form>

            {/* List */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Spinner size="md" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={FolderKanban}
                            title="No categories yet"
                            description="Add a category above to start organizing posts by specialty."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-surface-subtle border-b border-border-default">
                                <tr>
                                    {["Name", "Slug", "Created", ""].map((h, i) => (
                                        <th
                                            key={i}
                                            className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 py-3"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban size={14} className="text-brand-primary" />
                                                <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <code className="text-[11px] text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded">
                                                {cat.slug}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-muted">{fmtDate(cat.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(cat)}
                                                disabled={deletingId === cat.id}
                                                className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-md transition-colors disabled:opacity-50"
                                                title="Delete category"
                                            >
                                                {deletingId === cat.id ? <Spinner size="sm" /> : <Trash2 size={12} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
