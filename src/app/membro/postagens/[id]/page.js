"use client";

import { useState, useEffect, use } from "react";
import {
    Clock,
    MessageSquare,
    ChevronLeft,
    Send,
    Loader2,
    Calendar,
    Share2,
    Facebook,
    Twitter,
    Linkedin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostDetailPage({ params }) {
    const { id } = use(params);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/posts/${id}`);
                const data = await res.json();

                if (data.success) {
                    setPost(data.post);
                } else {
                    router.push("/membro");
                }
            } catch (error) {
                console.error("Error loading post:", error);
                router.push("/membro");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: comment })
            });
            const data = await res.json();
            if (data.success) {
                const postRes = await fetch(`/api/posts/${id}`);
                const postData = await postRes.json();
                setPost(postData.post);
                setComment("");
            }
        } catch (error) {
            console.error("Error commenting:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Carregando notícia...</p>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 md:px-0">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <Link
                    href="/membro"
                    className="flex items-center gap-1 text-primary-700 font-bold hover:underline text-sm uppercase tracking-wider"
                >
                    <ChevronLeft size={16} />
                    Voltar para o Feed
                </Link>
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest hidden md:block">
                    WBCT News
                </div>
            </div>

            <article className="space-y-8">
                {/* Header Jornalístico */}
                <header className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        {post.title}
                    </h1>

                    {/* Subtítulo simulado (se houver no futuro, usar post.subtitle) */}
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Confira os detalhes completos desta atualização importante para a comunidade.
                        Fique por dentro das novidades e discussões mais recentes.
                    </p>

                    {/* Meta Info & Share Lines */}
                    <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Por</span>
                                <span className="font-bold text-red-700 dark:text-red-500">{post.author.name}</span>
                                <span className="text-slate-300 mx-1">|</span>
                                <span className="text-primary-600 font-bold uppercase text-xs tracking-wider">WBCT Repórter</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock size={12} />
                                <time>{new Date(post.createdAt).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                                <span>•</span>
                                <span>Atualizado há pouco</span>
                            </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Compartilhar no Facebook">
                                <Facebook size={16} fill="white" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Compartilhar no Twitter">
                                <Twitter size={16} fill="white" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Compartilhar no WhatsApp">
                                <MessageSquare size={16} fill="white" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 transition-colors" title="Copiar Link">
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Imagem Principal (Contida) */}
                {post.image && (
                    <figure className="relative rounded-lg overflow-hidden w-full max-w-3xl mx-auto shadow-lg">
                        <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                        <figcaption className="bg-slate-50 dark:bg-slate-800 py-2 px-4 text-xs text-slate-500 text-center italic border-t border-slate-100 dark:border-slate-700">
                            Registro visual: {post.title} - Foto: Divulgação
                        </figcaption>
                    </figure>
                )}

                {/* Corpo do Texto */}
                <div className="max-w-3xl mx-auto">
                    {/* Estilos para citação jornalística injetados aqui */}
                    <style jsx global>{`
                        .prose blockquote {
                            border-left: none;
                            border-top: 2px solid #ef4444; /* red-500 */
                            border-bottom: 2px solid #ef4444;
                            padding: 2rem 1rem;
                            font-style: italic;
                            font-weight: 500;
                            text-align: center;
                            font-size: 1.25rem;
                            color: #334155; /* slate-700 */
                            background: transparent;
                            margin: 3rem 0;
                        }
                        .dark .prose blockquote {
                            color: #e2e8f0;
                        }
                        .prose a {
                            color: #dc2626; /* red-600 */
                            text-decoration: none;
                            font-weight: 700;
                        }
                        .prose a:hover {
                            text-decoration: underline;
                        }
                    `}</style>
                    <div
                        className="prose prose-lg prose-slate dark:prose-invert max-w-none font-serif md:font-sans leading-loose text-slate-800 dark:text-slate-200"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Separator */}
            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Comments Section */}
            <section className="max-w-3xl mx-auto pt-8">
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Comentários</h2>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">
                        {post.comments?.length || 0}
                    </span>
                </div>

                {/* Comment Input */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-10 border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleComment} className="flex flex-col gap-4">
                        <textarea
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Participe da discussão..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={submitting}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Respeite as regras da comunidade.</span>
                            <button
                                type="submit"
                                disabled={submitting || !comment.trim()}
                                className="bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Enviar</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {post.comments?.length === 0 ? (
                        <p className="text-slate-400 text-center italic">No comments yet.</p>
                    ) : (
                        post.comments.map((c) => (
                            <div key={c.id} className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 flex-shrink-0">
                                    {c.authorName.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{c.authorName}</span>
                                        <span className="text-xs text-slate-400">• {formatDistanceToNow(new Date(c.createdAt))}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        {c.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

// Utility function for relative time
function formatDistanceToNow(date) {
    const diff = (new Date() - date) / 1000;
    if (diff < 60) return 'há poucos segundos';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return `há ${Math.floor(diff / 86400)} dias`;
}
