"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    ChevronLeft,
    Calendar,
    Share2,
    FolderKanban
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";

export default function PostDetailPage() {
    const routeParams = useParams();
    const id = routeParams?.id;
    const [post, setPost] = useState(null);
    const [categoryName, setCategoryName] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/posts/${id}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.post);
                    if (data.post.categoryId) {
                        try {
                            const catRes = await fetch("/api/admin/post-categories");
                            const catData = await catRes.json();
                            if (catData.success) {
                                const match = (catData.categories || []).find((c) => c.id === data.post.categoryId);
                                if (match) setCategoryName(match.name);
                            }
                        } catch {
                            // category name is a nice-to-have, don't block
                        }
                    }
                } else {
                    router.push("/member");
                }
            } catch (error) {
                console.error("Failed to load post:", error);
                router.push("/member");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Loading article...</p>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16 px-4 md:px-0">
            {/* Navegação */}
            <div className="flex items-center justify-between border-b border-border-default pb-4">
                <Link
                    href="/member/articles"
                    className="flex items-center gap-1.5 text-brand-primary font-semibold text-xs hover:underline uppercase tracking-wider"
                >
                    <ChevronLeft size={15} />
                    Back to Articles
                </Link>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:block">
                    WBCT Community
                </span>
            </div>

            <article className="space-y-6">
                {/* Cabeçalho */}
                <header className="space-y-4">
                    {categoryName && (
                        <span className="inline-flex items-center gap-1.5 bg-brand-primary-light text-brand-primary-active text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                            <FolderKanban size={11} />
                            {categoryName}
                        </span>
                    )}
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta + Compartilhar */}
                    <div className="border-t border-b border-border-subtle py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar src={post.author?.image} name={post.author?.name} size="sm" />
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{post.author?.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                    <Calendar size={10} />
                                    <time>{new Date(post.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</time>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary transition-colors font-semibold"
                            title="Copiar link"
                        >
                            <Share2 size={13} />
                            Compartilhar
                        </button>
                    </div>
                </header>

                {/* Imagem de capa */}
                {post.image && (
                    <figure className="relative rounded-lg overflow-hidden shadow-card-hover">
                        <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                    </figure>
                )}

                {/* Content */}
                <div
                    className="prose prose-sm sm:prose max-w-none text-text-primary prose-headings:text-text-primary prose-a:text-brand-primary prose-blockquote:border-brand-primary"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
}
