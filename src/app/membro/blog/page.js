"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Clock,
    MessageSquare,
    ArrowRight,
    Loader2,
    Calendar,
    Search,
    BookOpen,
    User,
    ChevronRight,
    Image as ImageIcon
} from "lucide-react";

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
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Error loading posts:", error);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Loading Articles HUB...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header com busca */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                            <BookOpen size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Knowledge Hub</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Articles <span className="text-primary-600">HUB</span></h1>
                    <p className="text-slate-500 font-medium text-sm max-w-xl">
                        Access exclusive content, scientific articles and clinical case discussions shared by our community.
                    </p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="input pl-12 py-3 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white focus:ring-2 ring-primary-500/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Posts */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
                    <h3 className="text-2xl font-black text-slate-400">No articles found</h3>
                    <p className="text-slate-300 font-medium mt-2">Try adjusting your search terms or come back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/membro/postagens/${post.id}`}
                            className="group flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* Imagem de Capa */}
                            <div className="aspect-video overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-600 shadow-md">
                                        Article
                                    </span>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-4 flex-1 flex flex-col space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs">
                                            {post.author.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{post.author.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                                        <Calendar size={10} />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-xs leading-relaxed">
                                        {post.content}
                                    </p>
                                </div>

                                <div className="pt-3 mt-auto border-t border-slate-50 dark:border-slate-800 flex items-center justify-between group/btn">
                                    <div className="flex items-center gap-1 text-primary-600 font-black text-[10px] uppercase tracking-wider">
                                        Read Full <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-bold">Interact</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )
            }
        </div >
    );
}
