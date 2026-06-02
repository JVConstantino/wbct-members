"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Stethoscope,
    Mail,
    FileText,
    Calendar,
    MessageSquare,
    Award,
    ChevronRight,
    User,
    Image as ImageIcon,
    Send
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function DoctorProfilePage({ params }) {
    const { id } = use(params);
    const [doctor, setDoctor] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("NONE");
    const [followLoading, setFollowLoading] = useState(false);
    const [connectLoading, setConnectLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [chatLoading, setChatLoading] = useState(true);

    useEffect(() => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, [messages, showChat]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [doctorRes, postsRes] = await Promise.all([
                    fetch(`/api/users/public/${id}`),
                    fetch(`/api/posts?authorId=${id}&status=APPROVED`)
                ]);
                const [doctorData, postsData] = await Promise.all([doctorRes.json(), postsRes.json()]);
                if (doctorData.success) {
                    setDoctor(doctorData.user);
                    setIsFollowing(doctorData.user.isFollowing || false);
                }
                const connRes = await fetch("/api/users/connections").catch(() => null);
                if (connRes) {
                    const connData = await connRes.json();
                    if (connData.success && (connData.connections || []).some((c) => c.id === id)) {
                        setConnectionStatus("ACCEPTED");
                    }
                }
                if (postsData.success) setPosts(postsData.posts);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    useEffect(() => {
        if (!showChat || !id) return;
        const fetchMessages = async () => {
            setChatLoading(true);
            try {
                const res = await fetch(`/api/messages/${id}`);
                const data = await res.json();
                if (data.success) setMessages(data.messages);
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setChatLoading(false);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [showChat, id]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await fetch("/api/users/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: id })
            });
            const data = await res.json();
            if (data.success) setIsFollowing(data.isFollowing);
        } catch (error) {
            console.error("Failed to follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: id, content: newMessage })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { id: data.messageId, content: newMessage, senderId: "me", createdAt: new Date().toISOString() }]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleConnect = async () => {
        setConnectLoading(true);
        try {
            const res = await fetch("/api/users/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: id })
            });
            const data = await res.json();
            if (data.success) setConnectionStatus(data.status || "PENDING");
        } catch (error) {
            console.error("Failed to connect:", error);
        } finally {
            setConnectLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Loading profile...</p>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="text-center py-20">
                <EmptyState
                    icon={User}
                    title="Doctor not found"
                    description="This profile is not available."
                    action={<Link href="/member/directory" className="btn-secondary text-sm">← Back to Directory</Link>}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16 relative">
            <Link href="/member/directory" className="inline-flex items-center gap-1.5 text-text-muted hover:text-brand-primary font-semibold text-sm transition-colors">
                <ArrowLeft size={15} />
                Back to Directory
            </Link>

            {/* Header */}
            <div className="relative rounded-lg bg-brand-strong overflow-hidden shadow-card-hover">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#2563eb22,transparent_60%)]" />
                <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-lg bg-surface-card p-1 shadow-modal overflow-hidden shrink-0">
                        {doctor.image ? (
                            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <div className="w-full h-full rounded-md bg-brand-primary flex items-center justify-center text-white text-3xl font-bold">
                                {doctor.name?.charAt(0) || "M"}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                            <h1 className="text-2xl font-display font-bold text-white">{doctor.name || "Doctor"}</h1>
                            <div className="flex items-center gap-2 justify-center">
                                <button
                                    onClick={() => isFollowing && setShowChat(true)}
                                    disabled={!isFollowing}
                                    title={!isFollowing ? "Follow to send a message" : "Send message"}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10 ${isFollowing ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white/5 text-white/30 courser-not-allowed"}`}
                                >
                                    <MessageSquare size={13} /> Message
                                </button>
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${isFollowing ? "bg-white/20 text-white hover:bg-white/30" : "btn-primary"}`}
                                >
                                    {followLoading && <Spinner size="sm" />}
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={connectLoading || connectionStatus === "ACCEPTED"}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${connectionStatus === "ACCEPTED" ? "bg-status-success-bg text-status-success" : "bg-white/20 text-white hover:bg-white/30"}`}
                                >
                                    {connectLoading && <Spinner size="sm" />}
                                    {connectionStatus === "ACCEPTED" ? "Connected" : connectionStatus === "PENDING" ? "Request Sent" : "Connect"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                            <span className="flex items-center gap-1 bg-brand-primary/20 text-brand-primary px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                <Stethoscope size={12} /> Doctor
                            </span>
                            {doctor.stack && (
                                <span className="flex items-center gap-1 bg-white/10 text-white/80 px-2.5 py-1 rounded text-xs font-semibold">
                                    <Award size={12} /> {doctor.stack}
                                </span>
                            )}
                        </div>

                        {doctor.specialty && <p className="text-white/50 text-xs mb-1">{doctor.specialty}</p>}
                        {doctor.bio && <p className="text-white/70 text-sm leading-relaxed max-w-lg">{doctor.bio}</p>}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { icon: FileText, value: posts.length, label: "Articles" },
                    { icon: Stethoscope, value: doctor.stack || "—", label: "Specialty" },
                    { icon: Award, value: doctor.crm || "—", label: "CRM" },
                    { icon: Calendar, value: new Date(doctor.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }), label: "Member since" },
                ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 text-center">
                        <Icon className="mx-auto text-brand-primary mb-1.5" size={18} />
                        <p className="text-base font-bold text-text-primary truncate">{value}</p>
                        <p className="text-[11px] text-text-muted">{label}</p>
                    </div>
                ))}
            </div>

            {/* Publications */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text-primary">Publications</h2>
                    <span className="text-xs text-text-muted">{posts.length} article{posts.length !== 1 ? "s" : ""}</span>
                </div>

                {posts.length === 0 ? (
                    <EmptyState icon={FileText} title="No posts yet" description="This doctor has not published articles yet." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posts.map(post => (
                            <Link
                                key={post.id}
                                href={`/member/posts/${post.id}`}
                                className="group bg-surface-card rounded-lg border border-border-default shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
                            >
                                <div className="aspect-video bg-surface-subtle relative overflow-hidden">
                                    {post.image ? (
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                            <ImageIcon size={32} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(post.createdAt).toLocaleDateString("en-US")}
                                        </span>
                                        <span className="text-[11px] text-brand-primary font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                            Read <ChevronRight size={11} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Chat */}
            {showChat && (
                <div className="fixed inset-0 bg-brand-strong/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-surface-card w-full max-w-md rounded-lg shadow-modal overflow-hidden flex flex-col h-[520px] max-h-[90vh] border border-border-default">
                        {/* Header */}
                        <div className="bg-surface-subtle p-4 flex items-center justify-between border-b border-border-default">
                            <div className="flex items-center gap-3">
                                <Avatar src={doctor.image} name={doctor.name} size="sm" />
                                <div>
                                    <h3 className="font-semibold text-text-primary text-sm">{doctor.name}</h3>
                                    <p className="text-[11px] text-text-muted">Doctor · {doctor.stack || doctor.specialty || "General"}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="text-text-muted hover:text-text-primary transition-colors">
                                <span className="sr-only">Fechar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {/* Mensagens */}
                        <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-subtle/30">
                            {chatLoading ? (
                                <div className="flex justify-center py-8"><Spinner size="md" /></div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-text-muted text-xs">
                                    <MessageSquare className="mx-auto mb-2 opacity-40" size={28} />
                                    <p>Send the first message to start the conversation.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === "me" || msg.senderId !== id;
                                    return (
                                        <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMe
                                                ? "bg-brand-primary text-white rounded-tr-none"
                                                : "bg-surface-card text-text-primary border border-border-default rounded-tl-none shadow-sm"}`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 ${isMe ? "text-white/60" : "text-text-muted"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-surface-card border-t border-border-default flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                className="flex-1 input"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="p-2.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover disabled:opacity-50 disabled:courser-not-allowed transition-colors"
                            >
                                {sending ? <Spinner size="sm" /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
