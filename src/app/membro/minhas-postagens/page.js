"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Eye,
    Clock,
    Edit3,
    Trash2,
    Search,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

const STATUS_MAP = {
    APPROVED: { label: "Approved", icon: CheckCircle2, classes: "bg-status-success-bg text-status-success border-status-success/20" },
    PENDING:  { label: "In Review", icon: Clock, classes: "bg-status-warning-bg text-status-warning border-status-warning/20" },
    REJECTED: { label: "Rejected", icon: XCircle, classes: "bg-status-error-bg text-status-error border-status-error/20" },
    DRAFT:    { label: "Draft", icon: FileText, classes: "bg-surface-subtle text-text-muted border-border-default" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || STATUS_MAP.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.classes}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

export default function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [error, setError] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});

    useEffect(() => {
        fetchMyPosts();
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/admin/post-categories");
                const data = await res.json();
                if (data.success) {
                    const map = {};
                    for (const c of data.categories) map[c.id] = c.name;
                    setCategoryMap(map);
                }
            } catch {
                // category labels are optional
            }
        };
        fetchCategories();
    }, []);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/membro/posts");
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Server error: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) setPosts(data.posts);
            else throw new Error(data.error || "Failed to load data.");
        } catch (error) {
            console.error("Failed to load posts:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} post(s)?`)) return;
        try {
            const res = await fetch(`/api/posts?ids=${selectedIds.join(",")}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.filter(p => !selectedIds.includes(p.id)));
                setSelectedIds([]);
            }
        } catch (error) {
            console.error("Failed to bulk delete:", error);
        }
    };

    const FILTERS = [
        { key: "all", label: "All" },
        { key: "draft", label: "Drafts" },
        { key: "approved", label: "Approved" },
        { key: "pending", label: "In Review" },
    ];

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter.toUpperCase();
        return matchesSearch && matchesStatus;
    });

    const allSelected = filteredPosts.length > 0 && filteredPosts.every((p) => selectedIds.includes(p.id));
    const toggleSelectAll = () => {
        if (allSelected) return setSelectedIds([]);
        setSelectedIds(filteredPosts.map((p) => p.id));
    };
    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Loading your portfolio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            <PageHeader
                title="My Publications"
                subtitle="Track the performance and status of your content"
                actions={
                    <Button variant="primary" size="sm" icon={<Sparkles size={14} />} as={Link} href="/member/create">
                        New Post
                    </Button>
                }
            />

            {error && (
                <div className="p-4 bg-status-error-bg border border-status-error/20 rounded-md text-status-error font-semibold flex items-center gap-3">
                    <AlertCircle size={18} />
                    <div className="flex-1">
                        <p className="text-sm">Failed to load posts.</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                    <button onClick={fetchMyPosts} className="btn-danger text-xs">
                        Try Again
                    </button>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input
                        type="text"
                        placeholder="Search your posts..."
                        className="input !pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-surface-subtle p-1 rounded-md gap-1">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === f.key
                                ? "bg-surface-card text-brand-primary shadow-sm"
                                : "text-text-muted hover:text-text-secondary"}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Posts */}
            {selectedIds.length > 0 && (
                <div className="bg-status-warning-bg border border-status-warning/20 rounded-md p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-status-warning">{selectedIds.length} selected</span>
                    <button onClick={handleBulkDelete} className="btn-danger text-xs">Delete selected</button>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                <span>Select all visible</span>
            </div>

            {filteredPosts.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No posts found"
                    description="You do not have posts with this status yet."
                    action={
                        <Link href="/member/create" className="btn-primary text-sm flex items-center gap-1.5">
                            <Sparkles size={14} /> Start writing
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="group bg-surface-card rounded-lg border border-border-default shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row gap-4 items-stretch p-4">
                            <div className="self-start">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(post.id)}
                                    onChange={() => toggleSelect(post.id)}
                                />
                            </div>
                            {/* Thumbnail */}
                            <div className="w-full md:w-36 h-24 rounded-md overflow-hidden bg-surface-subtle shrink-0">
                                {post.image ? (
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                        <FileText size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Informações */}
                            <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge status={post.status} />
                                    {post.categoryId && categoryMap[post.categoryId] && (
                                        <span className="bg-brand-primary-light text-brand-primary-active px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {categoryMap[post.categoryId]}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1">
                                        <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString("en-US")}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                                    {post.title}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                                        <Eye size={12} className="text-brand-primary" />
                                        <span className="font-semibold text-text-secondary">{post.views || 0}</span>
                                        <span>views</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex md:flex-col gap-2 shrink-0">
                                {post.status === "APPROVED" && (
                                    <Link
                                        href={`/member/posts/${post.id}`}
                                        className="flex-1 md:flex-none btn-secondary text-xs flex items-center justify-center gap-1.5"
                                    >
                                        <Eye size={13} /> View
                                    </Link>
                                )}
                                <Link
                                    href={`/member/edit/post/${post.id}`}
                                    className="flex-1 md:flex-none px-3 py-2 rounded-md bg-status-warning-bg text-status-warning hover:bg-status-warning hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
                                    title="Edit"
                                >
                                    <Edit3 size={13} /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="flex-1 md:flex-none px-3 py-2 rounded-md bg-status-error-bg text-status-error hover:bg-status-error hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
                                    title="Delete"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
