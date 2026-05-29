"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
    Search,
    BookOpen,
    ChevronRight,
    Image as ImageIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";

export default function BlogListPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/posts?status=APPROVED");
                const data = await res.json();
                if (data.success) setPosts(data.posts);
            } catch (error) {
                console.error("Erro ao carregar posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-5 pb-8">
            {/* Banner */}
            <div className="relative rounded-lg bg-surface-card border border-border-default shadow-card px-6 py-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -mt-12 -mr-12 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-brand-primary-light rounded-md">
                                <BookOpen size={14} className="text-brand-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Hub de Conhecimento</span>
                        </div>
                        <h2 className="text-xl font-display font-bold text-text-primary">Artigos da Comunidade</h2>
                        <p className="text-sm text-text-secondary mt-0.5">
                            Acesse conteúdo exclusivo, artigos científicos e discussões de casos clínicos.
                        </p>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-text-muted">
                        <span className="text-brand-primary font-bold">{filteredPosts.length}</span> artigo{filteredPosts.length !== 1 ? "s" : ""} disponível{filteredPosts.length !== 1 ? "is" : ""}
                    </div>
                </div>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                    type="text"
                    placeholder="Buscar artigos..."
                    className="input !pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid de Posts */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-surface-card rounded-lg border border-border-default overflow-hidden">
                            <Skeleton variant="text" className="w-full aspect-video rounded-none" />
                            <div className="p-4 space-y-2">
                                <Skeleton variant="text" className="w-3/4 h-4" />
                                <Skeleton variant="text" className="w-full h-3" />
                                <Skeleton variant="text" className="w-2/3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Nenhum artigo encontrado"
                    description={searchTerm ? "Tente buscar com outros termos." : "Os artigos da comunidade aparecerão aqui em breve."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPosts.map(post => (
                        <Link
                            key={post.id}
                            href={`/membro/postagens/${post.id}`}
                            className="group flex flex-col bg-surface-card rounded-lg border border-border-default shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                        >
                            {/* Imagem de capa */}
                            <div className="aspect-video overflow-hidden relative bg-surface-subtle">
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                        <ImageIcon size={36} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className="bg-surface-card/95 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-brand-primary shadow-sm">
                                        Artigo
                                    </span>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar src={post.author?.image} name={post.author?.name} size="xs" />
                                        <span className="text-xs font-semibold text-text-primary">{post.author?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-muted text-[10px] font-semibold uppercase">
                                        <Calendar size={9} />
                                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed flex-1">
                                    {post.content?.replace(/<[^>]+>/g, "")}
                                </p>

                                <div className="flex items-center pt-3 border-t border-border-subtle">
                                    <span className="flex items-center gap-1 text-brand-primary text-[10px] font-semibold uppercase tracking-wide">
                                        Ler artigo <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
