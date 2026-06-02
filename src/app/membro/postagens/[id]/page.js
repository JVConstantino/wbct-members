"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    MessageSquare,
    ChevronLeft,
    Send,
    Calendar,
    Share2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";

export default function PostDetailPage() {
    const routeParams = useParams();
    const id = routeParams?.id;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [replyByComment, setReplyByComment] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/posts/${id}`);
                const data = await res.json();
                if (data.success) setPost(data.post);
                else router.push("/member");
            } catch (error) {
                console.error("Failed to load post:", error);
                router.push("/member");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, router]);

    const handleComment = async (e, parentId = null, value = null) => {
        e.preventDefault();
        const content = (value ?? comment).trim();
        if (!content) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, parentId })
            });
            const data = await res.json();
            if (data.success) {
                const postRes = await fetch(`/api/posts/${id}`);
                const postData = await postRes.json();
                setPost(postData.post);
                setComment("");
                if (parentId) setReplyByComment((prev) => ({ ...prev, [parentId]: "" }));
            }
        } catch (error) {
            console.error("Failed to comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Loading article...</p>
            </div>
        );
    }

    if (!post) return null;

    const topLevelComments = (post.comments || []).filter((c) => !c.parentId);
    const repliesByParent = (post.comments || []).reduce((acc, c) => {
        if (!c.parentId) return acc;
        if (!acc[c.parentId]) acc[c.parentId] = [];
        acc[c.parentId].push(c);
        return acc;
    }, {});

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

            <hr className="border-border-default" />

            {/* Comments */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-text-primary">Comments</h2>
                    <span className="bg-surface-subtle text-text-muted px-2 py-0.5 rounded text-xs font-semibold">
                        {post.comments?.length || 0}
                    </span>
                </div>

                {/* Input de comentário */}
                <div className="bg-surface-subtle rounded-md p-4 border border-border-subtle">
                    <form onSubmit={handleComment} className="flex flex-col gap-3">
                        <textarea
                            className="input min-h-[80px] resize-none"
                            placeholder="Join the discussion..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            disabled={submitting}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-text-muted">Respect the community guidelines.</span>
                            <button
                                type="submit"
                                disabled={submitting || !comment.trim()}
                                className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {submitting ? <Spinner size="sm" /> : <><Send size={13} /> Send</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de comments */}
                <div className="space-y-4">
                    {post.comments?.length === 0 ? (
                        <p className="text-text-muted text-sm text-center italic">No comments yet.</p>
                    ) : (
                        topLevelComments.map(c => (
                            <div key={c.id} className="space-y-2 p-3 rounded-md hover:bg-surface-subtle transition-colors">
                                <div className="flex gap-3">
                                <Avatar name={c.authorName} size="sm" className="shrink-0" />
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-text-primary text-sm">{c.authorName}</span>
                                        <span className="text-[11px] text-text-muted">• {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: enUS })}</span>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed">{c.content}</p>
                                    <button
                                        type="button"
                                        className="text-[11px] font-semibold text-brand-primary hover:underline"
                                        onClick={() => setReplyByComment((prev) => ({ ...prev, [c.id]: prev[c.id] ? "" : "@" }))}
                                    >
                                        Responder
                                    </button>
                                </div>
                                </div>

                                {replyByComment[c.id] !== undefined && (
                                    <form
                                        onSubmit={(e) => handleComment(e, c.id, replyByComment[c.id])}
                                        className="ml-12 flex gap-2"
                                    >
                                        <input
                                            className="input text-xs"
                                            placeholder="Escreva uma resposta..."
                                            value={replyByComment[c.id]}
                                            onChange={(e) => setReplyByComment((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                        />
                                        <button className="btn-primary text-xs" disabled={submitting}>Send</button>
                                    </form>
                                )}

                                {(repliesByParent[c.id] || []).map((r) => (
                                    <div key={r.id} className="ml-12 flex gap-2 p-2 rounded border border-border-subtle bg-surface-subtle/40">
                                        <Avatar name={r.authorName} size="xs" className="shrink-0" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-text-primary text-xs">{r.authorName}</span>
                                                <span className="text-[10px] text-text-muted">{formatDistanceToNow(new Date(r.createdAt))}</span>
                                            </div>
                                            <p className="text-xs text-text-secondary">{r.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
