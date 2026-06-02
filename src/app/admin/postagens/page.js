"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Trash2, Eye, Clock, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

const FILTERS = [
    { id: "all",      label: "All"     },
    { id: "pending",  label: "Pendings" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected"},
];

function PostStatusBadge({ status }) {
    if (status === "APPROVED") return <Badge variant="success">Approved</Badge>;
    if (status === "REJECTED") return <Badge variant="error">Rejected</Badge>;
    return <Badge variant="warning">Pending</Badge>;
}

function fmtDate(date) {
    return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export default function PostsPage() {
    const [posts, setPosts]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState("all");
    const [search, setSearch]       = useState("");
    const [error, setError]         = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewPost, setPreviewPost] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const q   = filter !== "all" ? `?status=${filter.toUpperCase()}` : "";
            const res = await fetch(`/api/posts${q}`);
            const data = await res.json();
            if (data.success) setPosts(data.posts);
            else setError(data.error || "Failed to load posts");
        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [filter]);
    useEffect(() => { setSelectedIds([]); }, [filter, search]);

    const updateStatus = async (id, status) => {
        const res = await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        const data = await res.json();
        if (data.success) fetchPosts();
    };

    const updateStatusBulk = async (status) => {
        if (!selectedIds.length) return;
        const res = await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds, status }),
        });
        const data = await res.json();
        if (data.success) {
            setSelectedIds([]);
            fetchPosts();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this post permanently?")) return;
        const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) fetchPosts();
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Delete ${selectedIds.length} post(s) permanentemente?`)) return;
        const res = await fetch(`/api/posts?ids=${selectedIds.join(",")}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setSelectedIds([]);
            fetchPosts();
        }
    };

    const handlePreview = async (id) => {
        try {
            setPreviewOpen(true);
            setPreviewLoading(true);
            const res = await fetch(`/api/posts/${id}`);
            const data = await res.json();
            if (data.success) setPreviewPost(data.post);
            else setError(data.error || "Failed to load preview");
        } catch {
            setError("Failed to load preview");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success && previewPost) {
            const refreshed = await fetch(`/api/posts/${previewPost.id}`);
            const postData = await refreshed.json();
            if (postData.success) setPreviewPost(postData.post);
        }
    };

    const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author?.name.toLowerCase().includes(search.toLowerCase())
    );

    const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.id));
    const toggleSelectAll = () => {
        if (allSelected) return setSelectedIds([]);
        setSelectedIds(filtered.map((p) => p.id));
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title="Posts"
                subtitle={`${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                {/* Filtro de status */}
                <div className="flex bg-surface-card border border-border-default rounded-md p-0.5 text-xs">
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 rounded-sm font-semibold transition-all ${
                                filter === f.id
                                    ? "bg-brand-primary text-white shadow-sm"
                                    : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Busca */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        className="input !pl-10 text-xs w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-status-error-bg border border-status-error/20 text-status-error px-3 py-2 rounded-md text-xs">
                    {error}
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="bg-brand-primary-light border border-brand-primary/20 text-brand-primary px-3 py-2 rounded-md flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold mr-1">{selectedIds.length} selecionada(s)</span>
                    <button onClick={() => updateStatusBulk("APPROVED")} className="btn-primary text-xs py-1.5 px-3">Aprovar</button>
                    <button onClick={() => updateStatusBulk("REJECTED")} className="btn-danger text-xs py-1.5 px-3">Rejeitar</button>
                    <button onClick={handleBulkDelete} className="btn-secondary text-xs py-1.5 px-3">Delete</button>
                </div>
            )}

            {/* Tabela */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton variant="text" className="w-8 h-8 rounded-md" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton variant="text" className="w-64 h-3" />
                                    <Skeleton variant="text" className="w-32 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={FileText}
                            title="No posts found"
                            description={search ? "Try another search term." : "There are no posts in this filter."}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-surface-subtle border-b border-border-default">
                                <tr>
                                    {["select", "Title", "Autor", "Data", "Status", ""].map((h, i) => (
                                        <th key={i} className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                            {h === "select" ? (
                                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                                            ) : h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {filtered.map((post) => (
                                    <tr key={post.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(post.id)}
                                                onChange={() => toggleSelect(post.id)}
                                            />
                                        </td>
                                        {/* Title */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {post.image ? (
                                                    <img
                                                        src={post.image}
                                                        alt=""
                                                        className="w-9 h-9 rounded-md object-cover hidden sm:block shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-md bg-surface-subtle hidden sm:flex items-center justify-center shrink-0">
                                                        <FileText size={14} className="text-text-muted" />
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                                                    {post.title}
                                                </p>
                                            </div>
                                        </td>
                                        {/* Autor */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Avatar src={post.author?.image} name={post.author?.name} size="xs" />
                                                <span className="text-xs text-text-secondary truncate max-w-[130px]">
                                                    {post.author?.name}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Data */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-muted flex items-center gap-1">
                                                <Clock size={10} />
                                                {fmtDate(post.createdAt)}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <PostStatusBadge status={post.status} />
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {post.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(post.id, "APPROVED")}
                                                            title="Aprovar"
                                                            className="p-1.5 bg-status-success text-white rounded-md hover:opacity-90 transition-opacity"
                                                        >
                                                            <CheckCircle size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(post.id, "REJECTED")}
                                                            title="Rejeitar"
                                                            className="p-1.5 bg-status-error text-white rounded-md hover:opacity-90 transition-opacity"
                                                        >
                                                            <XCircle size={12} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handlePreview(post.id)}
                                                    title="Visualizar"
                                                    className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-md transition-colors"
                                                >
                                                    <Eye size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    title="Delete"
                                                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-md transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={previewOpen}
                onClose={() => {
                    setPreviewOpen(false);
                    setPreviewPost(null);
                }}
                title="Post preview"
                size="2xl"
            >
                {previewLoading ? (
                    <div className="space-y-3">
                        <Skeleton variant="text" className="h-5 w-3/4" />
                        <Skeleton variant="text" className="h-4 w-1/3" />
                        <Skeleton variant="text" className="h-40 w-full" />
                    </div>
                ) : !previewPost ? (
                    <p className="text-sm text-text-muted">No content to display.</p>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-display text-xl font-bold text-text-primary">{previewPost.title}</h3>
                            <p className="text-xs text-text-muted mt-1">
                                {previewPost.author?.name} - {fmtDate(previewPost.createdAt)}
                            </p>
                        </div>

                        {previewPost.image && (
                            <img src={previewPost.image} alt="" className="w-full max-h-64 object-cover rounded-lg border border-border-default" />
                        )}

                        <article
                            className="prose prose-sm max-w-none text-text-primary"
                            dangerouslySetInnerHTML={{ __html: previewPost.content || "" }}
                        />

                        <div className="flex items-center gap-2 text-xs text-text-muted border-t border-border-default pt-3">
                            <PostStatusBadge status={previewPost.status} />
                            <span>{previewPost.comments?.length || 0} comentarios</span>
                        </div>

                        <div className="space-y-2 border-t border-border-default pt-3">
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Comment moderation</p>
                            {(previewPost.comments || []).length === 0 ? (
                                <p className="text-xs text-text-muted">No comments on this post.</p>
                            ) : (
                                (previewPost.comments || []).map((c) => (
                                    <div key={c.id} className="flex items-start justify-between gap-3 p-2 rounded border border-border-subtle bg-surface-subtle">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-text-primary">{c.authorName}</p>
                                            <p className="text-xs text-text-secondary line-clamp-2">{c.content}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            className="p-1.5 rounded text-status-error hover:bg-status-error-bg"
                                            title="Delete comment"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
