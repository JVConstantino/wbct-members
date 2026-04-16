"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Clock,
    MessageSquare,
    ArrowRight,
    Loader2,
    Image as ImageIcon,
    Calendar,
    TrendingUp,
    PlayCircle,
    Cpu,
    Terminal,
    Sparkles
} from "lucide-react";

export default function MemberHome() {
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const postsRes = await fetch("/api/posts?status=APPROVED");
                const postsData = await postsRes.json();
                if (postsData.success) setPosts(postsData.posts);

                const eventsRes = await fetch("/api/events");
                const eventsData = await eventsRes.json();
                if (eventsData.success) setEvents(eventsData.events.slice(0, 3));

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short"
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="relative">
                    <Loader2 className="animate-spin text-primary-600" size={64} />
                    <div className="absolute inset-0 blur-2xl bg-primary-400/20 rounded-full animate-pulse"></div>
                </div>
                <p className="text-slate-500 font-bold text-xl mt-6">Syncing your environment...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header de Boas Vindas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Your Hub <span className="text-brand-primary">WBCT Academy</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Welcome back! Explore new challenges and content.</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Link href="/membro/criar" className="btn-primary flex items-center gap-2">
                        <Sparkles size={16} />
                        New Post
                    </Link>
                </div>
            </div>

            {/* Feed Principal e Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lado Esquerdo: Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                            <TrendingUp size={18} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Community Feed</h2>
                    </div>

                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-500 font-bold text-xl">Your community is warming up.</p>
                            <p className="text-slate-400 text-sm mt-1">Be the first to share valuable content!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {posts.map((post) => (
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
                                                {post.content?.replace(/<[^>]*>?/gm, '')}
                                            </p>
                                        </div>

                                        <div className="pt-3 mt-auto border-t border-slate-50 dark:border-slate-800 flex items-center justify-between group/btn">
                                            <div className="flex items-center gap-1 text-primary-600 font-black text-[10px] uppercase tracking-wider">
                                                Read Full <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
                    )}
                </div>

                {/* Lado Direito: Cronograma, Webinars e Ads */}
                <div className="space-y-6">
                    {/* Cronograma Card */}
                    {events.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                                        <Calendar size={16} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Schedule</h3>
                                </div>
                                <Link href="/membro/eventos" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                    View all <ArrowRight size={10} />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {events.slice(0, 3).map((event) => (
                                    <Link
                                        key={event.id}
                                        href={event.link || "#"}
                                        target={event.link ? "_blank" : "_self"}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white shrink-0 text-xs"
                                            style={{ backgroundColor: event.color }}
                                        >
                                            <span className="font-black leading-none">
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase opacity-90">
                                                {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                                                {event.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatTime(event.date)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Aulas Card */}
                    <div className="bg-slate-900 dark:bg-black p-6 rounded-xl text-white relative overflow-hidden shadow-lg border border-slate-800">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-primary-600/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <PlayCircle size={18} className="text-primary-400" />
                                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Trending</span>
                            </div>
                            <h4 className="text-base font-black leading-tight text-white">Masterclass: Software Architecture 2026</h4>
                            <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative group cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                        <PlayCircle size={24} />
                                    </div>
                                </div>
                            </div>
                            <Link href="/membro/webinars" className="flex items-center justify-between group text-sm">
                                <span className="font-bold border-b border-primary-500 pb-0.5">View all courses</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-primary-400" />
                            </Link>
                        </div>
                    </div>

                    {/* Card de Comunidade */}
                    <div className="bg-brand-primary p-6 rounded-xl text-white space-y-3 shadow-lg shadow-brand-primary/20 relative overflow-hidden">
                        <Terminal className="absolute top-3 right-3 text-white/20" size={48} />
                        <h4 className="text-base font-black relative z-10 text-white">Invite a developer</h4>
                        <p className="text-xs font-medium text-primary-100 relative z-10 leading-relaxed">
                            The strength of the tech community lies in collaboration.
                        </p>
                        <button className="w-full py-3 bg-white text-brand-primary rounded-xl font-bold text-xs shadow-lg hover:bg-slate-50 transition-all relative z-10 uppercase tracking-wider">
                            Generate Invite Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
