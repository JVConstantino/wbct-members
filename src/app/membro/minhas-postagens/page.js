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
    APPROVED: { label: "Aprovado", icon: CheckCircle2, classes: "bg-status-success-bg text-status-success border-status-success/20" },
    PENDING:  { label: "Em Revisão", icon: Clock, classes: "bg-status-warning-bg text-status-warning border-status-warning/20" },
    REJECTED: { label: "Recusado", icon: XCircle, classes: "bg-status-error-bg text-status-error border-status-error/20" },
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

    useEffect(() => { fetchMyPosts(); }, []);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/membro/posts");
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Erro do servidor: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) setPosts(data.posts);
            else throw new Error(data.error || "Falha ao carregar dados.");
        } catch (error) {
            console.error("Erro ao carregar posts:", error);
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
            if (data.success) setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} postagem(ns)?`)) return;
        try {
            const res = await fetch(`/api/posts?ids=${selectedIds.join(",")}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.filter(p => !selectedIds.includes(p.id)));
                setSelectedIds([]);
            }
        } catch (error) {
            console.error("Erro ao excluir em massa:", error);
        }
    };

    const FILTERS = [
        { key: "all", label: "Todas" },
        { key: "approved", label: "Aprovadas" },
        { key: "pending", label: "Em Revisão" },
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
                <p className="text-text-muted text-sm">Carregando seu portfólio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            <PageHeader
                title="Minhas Publicações"
                subtitle="Acompanhe o desempenho e status dos seus conteúdos"
                actions={
                    <Button variant="primary" size="sm" icon={<Sparkles size={14} />} as={Link} href="/membro/criar">
                        Nova Postagem
                    </Button>
                }
            />

            {error && (
                <div className="p-4 bg-status-error-bg border border-status-error/20 rounded-md text-status-error font-semibold flex items-center gap-3">
                    <AlertCircle size={18} />
                    <div className="flex-1">
                        <p className="text-sm">Erro ao carregar postagens.</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                    <button onClick={fetchMyPosts} className="btn-danger text-xs">
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input
                        type="text"
                        placeholder="Pesquisar em seus posts..."
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
                            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${statusFilter === f.key
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
                    <span className="text-xs font-semibold text-status-warning">{selectedIds.length} selecionada(s)</span>
                    <button onClick={handleBulkDelete} className="btn-danger text-xs">Excluir selecionadas</button>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                <span>Selecionar todas visíveis</span>
            </div>

            {filteredPosts.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="Nenhuma postagem encontrada"
                    description="Você ainda não possui publicações neste status."
                    action={
                        <Link href="/membro/criar" className="btn-primary text-sm flex items-center gap-1.5">
                            <Sparkles size={14} /> Começar a escrever
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
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1">
                                        <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                                    {post.title}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                                        <Eye size={12} className="text-brand-primary" />
                                        <span className="font-semibold text-text-secondary">{post.views || 0}</span>
                                        <span>visitas</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                                        <MessageSquare size={12} className="text-brand-primary" />
                                        <span className="font-semibold text-text-secondary">{post.commentCount || 0}</span>
                                        <span>comentários</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex md:flex-col gap-2 shrink-0">
                                {post.status === "APPROVED" && (
                                    <Link
                                        href={`/membro/postagens/${post.id}`}
                                        className="flex-1 md:flex-none btn-secondary text-xs flex items-center justify-center gap-1.5"
                                    >
                                        <Eye size={13} /> Ver
                                    </Link>
                                )}
                                <Link
                                    href={`/membro/editar/post/${post.id}`}
                                    className="flex-1 md:flex-none px-3 py-2 rounded bg-status-warning-bg text-status-warning hover:bg-status-warning hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
                                    title="Editar"
                                >
                                    <Edit3 size={13} /> Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="flex-1 md:flex-none px-3 py-2 rounded bg-status-error-bg text-status-error hover:bg-status-error hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
                                    title="Excluir"
                                >
                                    <Trash2 size={13} /> Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
