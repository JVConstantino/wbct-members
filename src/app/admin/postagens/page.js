"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    Clock,
    Search,
    Loader2,
    MoreHorizontal,
    ChevronDown
} from "lucide-react";

export default function PostsManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== "all" ? `?status=${filter.toUpperCase()}` : "";
            const res = await fetch(`/api/posts${statusParam}`);
            const data = await res.json();

            if (data.success) {
                setPosts(data.posts);
            } else {
                setError(data.error || "Error loading posts");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch("/api/posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchPosts();
            } else {
                alert("Error updating status: " + data.error);
            }
        } catch (err) {
            alert("Connection error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Do you really want to delete this post?")) return;

        try {
            const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchPosts();
            } else {
                alert("Error deleting: " + data.error);
            }
        } catch (err) {
            alert("Connection error");
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short"
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Approved</span>;
            case "REJECTED":
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Rejected</span>;
            default:
                return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Pending</span>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Compacto */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-text-primary">Posts</h2>
                    <p className="text-slate-500 text-xs">Moderate and manage posts</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{filteredPosts.length} posts</span>
                </div>
            </div>

            {/* Filtros e Busca - Compactos */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="flex bg-surface-card p-0.5 rounded-lg border border-border-subtle text-xs">
                    {["all", "pending", "approved", "rejected"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md font-bold transition-all ${filter === f ? "bg-brand-primary text-white" : "text-text-muted hover:bg-surface-subtle"}`}
                        >
                            {f === "all" ? "All" : f === "pending" ? "Pending" : f === "approved" ? "Approved" : "Rejected"}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-surface-card border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                    {error}
                </div>
            )}

            {/* Tabela Responsiva */}
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-primary-600" size={24} />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <FileText className="text-slate-300 mb-2" size={32} />
                        <p className="text-slate-500 text-sm">No posts found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-surface-subtle border-b border-border-subtle">
                                <tr>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-3 py-2">Title</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-3 py-2">Author</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-3 py-2 hidden md:table-cell">Date</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-3 py-2">Status</th>
                                    <th className="text-right text-[10px] font-black text-text-muted uppercase px-3 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                {post.image && (
                                                    <img src={post.image} alt="" className="w-8 h-8 rounded object-cover hidden sm:block" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-bold text-text-primary text-sm truncate max-w-[180px] md:max-w-[250px]">{post.title}</p>
                                                    <p className="text-[10px] text-text-muted truncate max-w-[150px] md:hidden">{post.author.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px]">
                                                    {post.author.name.charAt(0)}
                                                </div>
                                                <span className="text-xs text-text-secondary truncate max-w-[120px]">{post.author.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 hidden md:table-cell">
                                            <span className="text-xs text-text-muted flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(post.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {getStatusBadge(post.status)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {post.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(post.id, "APPROVED")}
                                                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(post.id, "REJECTED")}
                                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={12} />
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/membro/postagens/${post.id}`}
                                                    target="_blank"
                                                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                                    title="View"
                                                >
                                                    <Eye size={12} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
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
        </div>
    );
}
