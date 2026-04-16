"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Eye,
    MessageSquare,
    Clock,
    Edit3,
    Trash2,
    Loader2,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react";

export default function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMyPosts();
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
            if (data.success) {
                setPosts(data.posts);
            } else {
                throw new Error(data.error || "Failed to load data.");
            }
        } catch (error) {
            console.error("Error loading my posts:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

        try {
            const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (error) {
            alert("Error deleting post.");
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            REJECTED: "bg-red-50 text-red-600 border-red-100"
        };
        const labels = {
            APPROVED: "Aprovado",
            PENDING: "Em Revisão",
            REJECTED: "Recusado"
        };
        const Icons = {
            APPROVED: CheckCircle2,
            PENDING: Clock,
            REJECTED: XCircle
        };
        const Icon = Icons[status] || Clock;

        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
                <Icon size={12} />
                {labels[status]}
            </span>
        );
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter.toUpperCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Carregando seu portfólio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Minhas <span className="text-primary-600">Publicações</span></h1>
                    <p className="text-slate-500 font-medium text-lg">Acompanhe o desempenho e status dos seus conteúdos científicos.</p>
                </div>
                <Link href="/membro/criar" className="btn-primary flex items-center gap-2 px-8">
                    <Sparkles size={20} />
                    Novo Post
                </Link>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold flex items-center gap-3 animate-in shake">
                    <AlertCircle size={24} />
                    <div className="flex-1">
                        <p className="text-lg tracking-tight">Ops! Algo deu errado.</p>
                        <p className="text-sm font-medium opacity-80">{error}</p>
                    </div>
                    <button onClick={fetchMyPosts} className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar em seus posts..."
                        className="input pl-16 border-none bg-slate-50 dark:bg-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 w-full lg:w-auto overflow-x-auto">
                    {["all", "approved", "pending"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${statusFilter === f ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            {f === "all" ? "Todos" : f === "approved" ? "Aprovados" : "Em Revisão"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Posts */}
            <div className="grid grid-cols-1 gap-6">
                {filteredPosts.length === 0 ? (
                    <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <FileText className="mx-auto text-slate-300 mb-6" size={64} />
                        <h3 className="text-2xl font-black text-slate-500 tracking-tight">No posts found</h3>
                        <p className="text-slate-400 mt-2 font-medium">Você ainda não possui publicações neste status.</p>
                        <Link href="/membro/criar" className="btn-primary mt-8 inline-flex items-center gap-2">Começar a escrever</Link>
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <div key={post.id} className="group bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 items-center">
                            {/* Thumb */}
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 shadow-inner">
                                {post.image ? (
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <FileText size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Informações */}
                            <div className="flex-1 space-y-4 w-full text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <StatusBadge status={post.status} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary-600 transition-colors">{post.title}</h3>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <Eye size={16} className="text-primary-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black leading-none">{post.views || 0}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Visitas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <MessageSquare size={16} className="text-primary-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black leading-none">{post.commentCount || 0}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Comentários</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex md:flex-col gap-3 shrink-0 w-full md:w-auto">
                                <Link
                                    href={post.status === 'APPROVED' ? `/membro/postagens/${post.id}` : '#'}
                                    className={`flex-1 md:w-full p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all 
                                        ${post.status === 'APPROVED' ? 'bg-white border-slate-100 text-slate-600 hover:border-primary-200 hover:text-primary-600' : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed'}`}
                                >
                                    <Eye size={18} /> Ver Post
                                </Link>
                                <div className="flex gap-2 flex-1 md:w-full">
                                    <Link
                                        href={`/membro/editar/post/${post.id}`}
                                        className="flex-1 p-4 rounded-2xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                        title="Editar"
                                    >
                                        <Edit3 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="flex-1 p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
