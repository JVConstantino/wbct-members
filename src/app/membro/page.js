"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Clock, ArrowRight, Image as ImageIcon,
    Calendar, TrendingUp, PlayCircle, Sparkles, PlusSquare,
    Users, BookOpen
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MemberHome() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [latestWebinar, setLatestWebinar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [postsRes, eventsRes, coursesRes] = await Promise.all([
                    fetch("/api/posts?status=APPROVED"),
                    fetch("/api/events"),
                    fetch("/api/courses"),
                ]);
                const postsData   = await postsRes.json();
                const eventsData  = await eventsRes.json();
                const coursesData = await coursesRes.json();
                if (postsData.success)  setPosts(postsData.posts);
                if (eventsData.success) setEvents(eventsData.events.slice(0, 3));
                if (coursesData.success) setLatestWebinar(coursesData.courses[0] || null);
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const firstName = session?.user?.name?.split(" ")[0] || "Member";

    return (
        <div className="space-y-4 sm:space-y-6 pb-8 px-3 sm:px-0">

            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-lg bg-surface-card border border-border-default shadow-card px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -mt-12 -mr-12 pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-lg sm:text-xl font-display font-bold text-text-primary">
                        Hello, <span className="text-brand-primary">{firstName}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                        Explore community content and share your knowledge.
                    </p>
                </div>
                <div className="relative z-10 shrink-0">
                    <Link href="/member/create" className="btn-primary gap-2 w-full sm:w-auto justify-center">
                        <PlusSquare size={15} />
                        New Post
                    </Link>
                </div>
            </div>

            {/* Grid: Feed + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* ── Feed principal ── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="p-1.5 bg-brand-primary-light text-brand-primary rounded-md">
                            <TrendingUp size={15} />
                        </div>
                        <h3 className="text-sm sm:text-base font-display font-semibold text-text-primary">Community Feed</h3>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-surface-card rounded-lg border border-border-default p-4 space-y-3">
                                    <Skeleton variant="text" className="w-full h-32 rounded-md" />
                                    <Skeleton variant="text" className="w-3/4 h-4" />
                                    <Skeleton variant="text" className="w-full h-3" />
                                    <Skeleton variant="text" className="w-full h-3" />
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <EmptyState
                            icon={BookOpen}
                            title="No posts yet"
                            description="Be the first to share knowledge with the community."
                            action={
                                <Link href="/member/create" className="btn-primary gap-2">
                                    <PlusSquare size={14} />
                                    Create first post
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/member/posts/${post.id}`}
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
                                                <ImageIcon size={40} strokeWidth={1.5} />
                                            </div>
                                        )}
                                        <div className="absolute top-2.5 left-2.5">
                                            <span className="bg-surface-card/95 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-brand-primary shadow-sm">
                                                Article
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
                                        {/* Autor + data */}
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Avatar
                                                    src={post.author?.image}
                                                    name={post.author?.name}
                                                    size="xs"
                                                />
                                                <span className="text-xs font-medium text-text-secondary truncate">
                                                    {post.author?.name}
                                                </span>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-1 text-text-muted text-[10px] shrink-0">
                                                <Calendar size={10} />
                                                {new Date(post.createdAt).toLocaleDateString("en-US")}
                                            </div>
                                        </div>

                                        {/* Título + resumo */}
                                        <div className="space-y-1.5">
                                            <h4 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                                                {post.title}
                                            </h4>
                                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                                {post.content?.replace(/<[^>]*>?/gm, "")}
                                            </p>
                                        </div>

                                        {/* Rodapé */}
                                        <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-brand-primary text-[10px] font-semibold uppercase tracking-wide">
                                                Read article <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Sidebar direita ── */}
                <div className="space-y-5">

                    {/* Próximos eventos */}
                    {!loading && events.length > 0 && (
                        <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-status-warning-bg text-status-warning rounded-md">
                                        <Calendar size={14} />
                                    </div>
                                    <h4 className="text-sm font-semibold text-text-primary">Upcoming Events</h4>
                                </div>
                                <Link href="/member/events" className="text-[10px] font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors">
                                    View all <ArrowRight size={10} />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {events.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={event.link || "#"}
                                        target={event.link ? "_blank" : "_self"}
                                        className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-md bg-surface-subtle hover:bg-surface-section transition-colors group"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-md flex flex-col items-center justify-center text-white shrink-0 text-xs"
                                            style={{ backgroundColor: event.color || "var(--color-brand-primary)" }}
                                        >
                                            <span className="font-bold leading-none text-sm">
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className="text-[8px] font-semibold uppercase opacity-90">
                                                {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                                                {event.title}
                                            </p>
                                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                                                <Clock size={9} />
                                                {formatTime(event.date)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Webinars */}
                    <div className="bg-brand-strong rounded-lg p-5 text-white relative overflow-hidden shadow-card">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/30 rounded-full blur-2xl -mt-4 -mr-4 pointer-events-none" />
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-2">
                                <PlayCircle size={16} className="text-brand-primary-light" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Em destaque</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-display font-bold leading-snug line-clamp-2">
                                {latestWebinar ? latestWebinar.title : "Recordings"}
                            </h4>
                            <Link
                                href={latestWebinar ? `/member/webinars/${latestWebinar.id}` : "/member/webinars"}
                                className="aspect-video bg-surface-subtle rounded-md overflow-hidden relative group block"
                            >
                                {latestWebinar?.image ? (
                                    <img
                                        src={latestWebinar.image}
                                        alt={latestWebinar.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : null}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                        <PlayCircle size={22} className="text-white" />
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/member/webinars"
                                className="flex items-center justify-between text-xs font-semibold text-brand-primary-light hover:text-white transition-colors group"
                            >
                                <span>View all recordings</span>
                                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Comunidade */}
                    <div className="bg-brand-primary rounded-lg p-5 text-white relative overflow-hidden shadow-button-primary">
                        <div className="absolute top-2 right-2 text-white/10">
                            <Users size={48} />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <h4 className="text-sm sm:text-base font-display font-bold">Invite a colleague</h4>
                            <p className="text-xs text-blue-100 leading-relaxed">
                                The strength of the medical community is collaboration. Invite other members to the platform.
                            </p>
                            <button className="w-full py-2.5 bg-white text-brand-primary rounded-md font-semibold text-xs shadow-sm hover:bg-blue-50 transition-colors uppercase tracking-wide">
                                Generate Invite Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
