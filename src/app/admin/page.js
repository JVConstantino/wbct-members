"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, Calendar, Clock,
    UserPlus, CheckCircle, Activity,
    Wifi, ChevronRight, MoreHorizontal, XCircle, Eye,
    CalendarCheck
} from "lucide-react";
import {
    AreaChart, Area, Tooltip, ResponsiveContainer
} from "recharts";
import { Avatar }          from "@/components/ui/Avatar";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Skeleton }        from "@/components/ui/Skeleton";
import { EmptyState }      from "@/components/ui/EmptyState";
import { PageHeader }      from "@/components/ui/PageHeader";

// ── Cores dos gráficos (tokens fixos para recharts) ──
const CHART_BLUE = "#2563eb";

// ── Card de estatística ──
function StatCard({ title, value, icon: Icon, accent = false, live = false, loading = false }) {
    return (
        <div className={`card flex flex-col gap-3 ${accent ? "bg-brand-primary border-brand-primary text-white" : ""}`}>
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-md ${accent ? "bg-white/20" : "bg-brand-primary-light"}`}>
                    <Icon size={16} className={accent ? "text-white" : "text-brand-primary"} />
                </div>
                {live && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-status-success uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                        Ao vivo
                    </span>
                )}
            </div>
            {loading ? (
                <Skeleton variant="raw" className="h-8 w-16" />
            ) : (
                <p className={`text-3xl font-display font-bold leading-none ${accent ? "text-white" : "text-text-primary"}`}>
                    {value}
                </p>
            )}
            <p className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-white/70" : "text-text-muted"}`}>
                {title}
            </p>
        </div>
    );
}

export default function AdminDashboard() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchStats = async () => {
        try {
            const res    = await fetch(`/api/admin/stats?range=7d`);
            const result = await res.json();
            if (result.success) setData(result);
        } catch (e) {
            console.error("Failed to load stats:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const iv = setInterval(fetchStats, 30000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const online       = data?.stats?.online       || 0;
    const totalMembers = data?.stats?.members       || 0;
    const pendingPosts = data?.stats?.pendingPosts  || 0;
    const pendingMembers = data?.stats?.pendingMembers || 0;
    const upcomingEvt  = data?.stats?.upcomingEvents || 0;
    const pendingEventConfirmations = data?.stats?.pendingEventConfirmations || 0;

    const loginHistory = (data?.trends?.dailyLogins || []).map(item => ({
        name:   new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
        logins: item.count,
    }));

    const handlePostAction = async (postId, status) => {
        await fetch("/api/posts", {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id: postId, status }),
        });
        // Recarrega dados
        const res = await fetch("/api/admin/stats?range=7d");
        const result = await res.json();
        if (result.success) setData(result);
    };

    return (
        <div className="space-y-5 animate-fade-in min-w-0">

            <PageHeader
                title="Dashboard"
                subtitle="Platform overview"
                actions={
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-status-success-bg text-status-success rounded-md text-xs font-semibold border border-status-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                        {online} online now
                    </span>
                }
            />

            {/* ── Cards de estatísticas ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard title="Members"      value={totalMembers} icon={Users}    loading={loading} accent />
                <StatCard title="Online Now" value={online}       icon={Wifi}     loading={loading} live />
                <StatCard title="Posts pendings" value={pendingPosts} icon={Clock}    loading={loading} />
                <StatCard title="Events"      value={upcomingEvt}  icon={Calendar} loading={loading} />
            </div>

            {/* ── Cadastros pendings ── */}
            <div className="card p-0 overflow-hidden space-y-0">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus size={15} className="text-status-warning" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Pending registrations</h3>
                    </div>
                    {pendingMembers > 0 && (
                        <Badge variant="warning" dot>{pendingMembers} pending{pendingMembers !== 1 ? "s" : ""}</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="p-4">
                        <Skeleton variant="table" lines={3} />
                    </div>
                ) : !data?.pendingMembers?.length ? (
                    <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="No pending registrations"
                        description="All access requests have been handled."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-sm">
                            <thead>
                                <tr className="bg-surface-section">
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Name</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">E-mail</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Requested At</th>
                                    <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingMembers.map((member) => (
                                    <tr key={member.id} className="border-t border-border-subtle hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-text-primary truncate max-w-[220px] block">{member.name || "No name"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted truncate max-w-[220px] block">{member.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{new Date(member.createdAt).toLocaleDateString("en-US")}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/members?search=${encodeURIComponent(member.email)}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover"
                                            >
                                                Review
                                                <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Confirmações de evento pendentes ── */}
            <div className="card p-0 overflow-hidden space-y-0">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarCheck size={15} className="text-status-warning" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Pending Event Confirmations</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingEventConfirmations > 0 && (
                            <Badge variant="warning" dot>{pendingEventConfirmations} pending{pendingEventConfirmations !== 1 ? "s" : ""}</Badge>
                        )}
                        <Link
                            href="/admin/events"
                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            View all <ChevronRight size={13} />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="p-4">
                        <Skeleton variant="table" lines={2} />
                    </div>
                ) : !data?.pendingEventConfirmations?.length ? (
                    <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="No pending confirmations"
                        description="All event follow requests have been reviewed."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] text-sm">
                            <thead>
                                <tr className="bg-surface-section">
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Event</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Member</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Requested At</th>
                                    <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingEventConfirmations.map((p) => (
                                    <tr key={`${p.eventId}_${p.userId}`} className="border-t border-border-subtle hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-text-primary truncate max-w-[220px] block">{p.eventTitle}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted truncate max-w-[220px] block">{p.memberName}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{new Date(p.updatedAt).toLocaleDateString("en-US")}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href="/admin/events"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover"
                                            >
                                                Review
                                                <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Atividade de login (últimos 7 dias) ── */}
            <div className="card flex items-center gap-4 py-4">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="p-2 rounded-md bg-brand-primary-light">
                        <Activity size={15} className="text-brand-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Login Activity</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Last 7 days</p>
                    </div>
                </div>
                <div className="flex-1 h-12 min-w-0">
                    {mounted && loginHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={40}>
                            <AreaChart data={loginHistory}>
                                <defs>
                                    <linearGradient id="blueGradSpark" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_BLUE} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-default)",
                                        background: "var(--surface-card)",
                                        color: "var(--text-primary)",
                                        fontSize: "12px",
                                        boxShadow: "var(--shadow-card)",
                                    }}
                                    labelFormatter={() => ""}
                                />
                                <Area
                                    type="monotone" dataKey="logins"
                                    stroke={CHART_BLUE} strokeWidth={2}
                                    fill="url(#blueGradSpark)"
                                    dot={false}
                                    activeDot={{ r: 3, fill: CHART_BLUE }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center text-xs text-text-muted">No logins in this period yet.</div>
                    )}
                </div>
                <Link
                    href="/admin/analytics"
                    className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors shrink-0"
                >
                    Full analytics <ChevronRight size={13} />
                </Link>
            </div>

            {/* Members recentes */}
            <div className="grid grid-cols-1 gap-4">
                <div className="card p-0 overflow-hidden space-y-0">
                    <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus size={15} className="text-brand-primary" />
                            <h3 className="font-display text-sm font-semibold text-text-primary">Recent Members</h3>
                        </div>
                        <Link
                            href="/admin/members"
                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            View all <ChevronRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1,2,3].map(i => <Skeleton key={i} variant="avatar" />)}
                        </div>
                    ) : !data?.recentMembers?.length ? (
                        <EmptyState icon={<Users size={20} />} title="No members found" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[380px] text-sm">
                                <thead>
                                    <tr className="bg-surface-section">
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Member</th>
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5 hidden sm:table-cell">E-mail</th>
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Profile</th>
                                        <th className="px-4 py-2.5" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentMembers.slice(0, 5).map((m) => (
                                        <tr key={m.id} className="border-t border-border-subtle hover:bg-surface-subtle transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar src={m.image} name={m.name} size="sm" />
                                                    <span className="font-medium text-text-primary truncate max-w-[120px]">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-xs text-text-muted truncate max-w-[160px] block">{m.email}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <RoleBadge role={m.role} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/members`}
                                                    className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-subtle transition-colors inline-flex"
                                                >
                                                    <MoreHorizontal size={15} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Moderação de postagens pendings ── */}
            <div className="card p-0 overflow-hidden space-y-0">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={15} className="text-status-warning" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Posts pendings</h3>
                    </div>
                    {pendingPosts > 0 && (
                        <Badge variant="warning" dot>{pendingPosts} pending{pendingPosts !== 1 ? "s" : ""}</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="p-4">
                        <Skeleton variant="table" lines={3} />
                    </div>
                ) : !data?.pendingPosts?.length ? (
                    <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="No pending posts"
                        description="All posts have been moderated."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-sm">
                            <thead>
                                <tr className="bg-surface-section">
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Title</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Autor</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Data</th>
                                    <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingPosts.map((post) => (
                                    <tr key={post.id} className="border-t border-border-subtle hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-text-primary truncate max-w-[220px] block">{post.title}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{post.authorName}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">
                                                {new Date(post.createdAt).toLocaleDateString("en-US")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handlePostAction(post.id, "APPROVED")}
                                                    className="p-1.5 bg-status-success-bg text-status-success rounded-md hover:bg-status-success hover:text-white transition-all"
                                                    title="Aprovar"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handlePostAction(post.id, "REJECTED")}
                                                    className="p-1.5 bg-status-error-bg text-status-error rounded-md hover:bg-status-error hover:text-white transition-all"
                                                    title="Rejeitar"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                                <Link
                                                    href={`/admin/posts`}
                                                    className="p-1.5 bg-surface-subtle text-text-muted rounded-md hover:bg-surface-section hover:text-text-primary transition-all inline-flex"
                                                    title="View post"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
