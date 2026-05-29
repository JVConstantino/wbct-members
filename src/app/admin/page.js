"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, FileText, Calendar, TrendingUp, Clock,
    UserPlus, CheckCircle, BarChart3, Activity,
    Wifi, ChevronRight, MoreHorizontal, XCircle, Eye
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { Avatar }          from "@/components/ui/Avatar";
import { Badge, PostStatusBadge, RoleBadge } from "@/components/ui/Badge";
import { Skeleton }        from "@/components/ui/Skeleton";
import { EmptyState }      from "@/components/ui/EmptyState";
import { PageHeader }      from "@/components/ui/PageHeader";

const TIME_RANGES = [
    { key: "24h",  label: "24h" },
    { key: "48h",  label: "48h" },
    { key: "7d",   label: "7d" },
    { key: "30d",  label: "30d" },
    { key: "90d",  label: "90d" },
];

// ── Cores dos gráficos (tokens fixos para recharts) ──
const CHART_BLUE    = "#2563eb";
const CHART_BLUE_DIM = "rgba(37,99,235,0.12)";
const CHART_SUCCESS = "#059669";
const CHART_WARNING = "#d97706";
const CHART_ERROR   = "#dc2626";

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
    const [timeRange, setTimeRange] = useState("7d");
    const [mounted, setMounted] = useState(false);

    const fetchStats = async (range) => {
        try {
            const r = range || timeRange;
            const res    = await fetch(`/api/admin/stats?range=${r}`);
            const result = await res.json();
            if (result.success) setData(result);
        } catch (e) {
            console.error("Erro ao carregar estatísticas:", e);
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

    const handleRangeChange = (range) => {
        setTimeRange(range);
        setLoading(true);
        fetchStats(range);
    };

    const online       = data?.stats?.online       || 0;
    const totalMembers = data?.stats?.members       || 0;
    const pendingPosts = data?.stats?.pendingPosts  || 0;
    const pendingMembers = data?.stats?.pendingMembers || 0;
    const upcomingEvt  = data?.stats?.upcomingEvents || 0;

    const postStatusData = [
        { name: "Aprovados", value: data?.stats?.approvedPosts || 0, color: CHART_SUCCESS },
        { name: "Pendentes", value: pendingPosts,                    color: CHART_WARNING },
        { name: "Rejeitados", value: data?.stats?.rejectedPosts || 0, color: CHART_ERROR },
    ];

    const loginHistory = (data?.trends?.dailyLogins || []).map(item => ({
        name:   new Date(item.date).toLocaleDateString("pt-BR", { weekday: "short" }),
        logins: item.count,
    })).concat(
        data?.trends?.dailyLogins?.length ? [] :
        ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((n, i) => ({ name: n, logins: [12,19,15,22,30,18,10][i] }))
    );

    const growthData = data?.trends?.monthlyGrowth || [
        { month: "Jan", count: 5 },
        { month: "Fev", count: 8 },
        { month: "Mar", count: 12 },
        { month: "Abr", count: 15 },
    ];

    const handlePostAction = async (postId, status) => {
        await fetch("/api/posts", {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id: postId, status }),
        });
        // Recarrega dados
        const res = await fetch("/api/admin/stats");
        const result = await res.json();
        if (result.success) setData(result);
    };

    return (
        <div className="space-y-5 animate-fade-in min-w-0">

            <PageHeader
                title="Dashboard"
                subtitle="Visão geral da plataforma"
                actions={
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-status-success-bg text-status-success rounded-md text-xs font-semibold border border-status-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                        {online} online agora
                    </span>
                }
            />

            {/* ── Cards de estatísticas ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard title="Membros"      value={totalMembers} icon={Users}    loading={loading} accent />
                <StatCard title="Online agora" value={online}       icon={Wifi}     loading={loading} live />
                <StatCard title="Posts pendentes" value={pendingPosts} icon={Clock}    loading={loading} />
                <StatCard title="Eventos"      value={upcomingEvt}  icon={Calendar} loading={loading} />
            </div>

            {/* ── Cadastros pendentes ── */}
            <div className="card p-0 overflow-hidden space-y-0">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus size={15} className="text-status-warning" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Cadastros pendentes de aprovação</h3>
                    </div>
                    {pendingMembers > 0 && (
                        <Badge variant="warning" dot>{pendingMembers} pendente{pendingMembers !== 1 ? "s" : ""}</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="p-4">
                        <Skeleton variant="table" lines={3} />
                    </div>
                ) : !data?.pendingMembers?.length ? (
                    <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="Nenhum cadastro pendente"
                        description="Todas as solicitações de acesso já foram tratadas."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-sm">
                            <thead>
                                <tr className="bg-surface-section">
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Nome</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">E-mail</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Solicitado em</th>
                                    <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingMembers.map((member) => (
                                    <tr key={member.id} className="border-t border-border-subtle hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-text-primary truncate max-w-[220px] block">{member.name || "Sem nome"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted truncate max-w-[220px] block">{member.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{new Date(member.createdAt).toLocaleDateString("pt-BR")}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/membros?search=${encodeURIComponent(member.email)}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover"
                                            >
                                                Revisar
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

            {/* ── Filtro de período ── */}
            <div className="flex flex-wrap items-center gap-1 bg-surface-subtle p-1 rounded-md w-fit max-w-full">
                {TIME_RANGES.map(r => (
                    <button
                        key={r.key}
                        onClick={() => handleRangeChange(r.key)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                            timeRange === r.key
                                ? "bg-surface-card text-brand-primary shadow-sm"
                                : "text-text-muted hover:text-text-secondary"
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* ── Gráficos ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Atividade semanal */}
                <div className="card lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-brand-primary" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Atividades de login</h3>
                        <span className="ml-auto text-xs text-text-muted">Período selecionado</span>
                    </div>
                    <div className="h-[200px]">
                        {mounted ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={200}>
                            <AreaChart data={loginHistory}>
                                <defs>
                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_BLUE} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false} tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 600, fill: "var(--text-muted)" }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-default)",
                                        background: "var(--surface-card)",
                                        color: "var(--text-primary)",
                                        fontSize: "12px",
                                        boxShadow: "var(--shadow-card)",
                                    }}
                                    cursor={{ stroke: CHART_BLUE, strokeWidth: 1, strokeDasharray: "4 2" }}
                                />
                                <Area
                                    type="monotone" dataKey="logins"
                                    stroke={CHART_BLUE} strokeWidth={2}
                                    fill="url(#blueGrad)"
                                    dot={{ fill: CHART_BLUE, r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: CHART_BLUE }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : <Skeleton variant="stat" className="h-full w-full" />}
                    </div>
                </div>

                {/* Status de posts */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-brand-primary" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Status das postagens</h3>
                    </div>
                    {loading ? (
                        <Skeleton variant="stat" />
                    ) : (
                        <>
                            <div className="h-[160px]">
                                {mounted ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={220} minHeight={160}>
                                    <PieChart>
                                        <Pie
                                            data={postStatusData} cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={65}
                                            paddingAngle={4} dataKey="value"
                                        >
                                            {postStatusData.map((e, i) => (
                                                <Cell key={i} fill={e.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "1px solid var(--border-default)",
                                                background: "var(--surface-card)",
                                                fontSize: "12px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                ) : <Skeleton variant="stat" className="h-full w-full" />}
                            </div>
                            <div className="space-y-1.5">
                                {postStatusData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-text-secondary">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Crescimento + Membros recentes ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Crescimento mensal */}
                <div className="bg-brand-strong rounded-lg p-5 space-y-4 border border-brand-strong">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-white" />
                            <h3 className="font-display text-sm font-semibold text-white">Crescimento</h3>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white font-semibold uppercase tracking-wide">
                            mensal
                        </span>
                    </div>
                    <div className="h-[110px]">
                        {mounted ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={110}>
                            <BarChart data={growthData} barSize={14}>
                                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                    {growthData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={i === growthData.length - 1 ? CHART_BLUE : "rgba(255,255,255,0.72)"}
                                        />
                                    ))}
                                </Bar>
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.78)", fontWeight: 600 }}
                                    axisLine={false} tickLine={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : <Skeleton variant="stat" className="h-full w-full" />}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                        <span className="inline-flex items-center gap-1 text-white"><span className="w-2 h-2 rounded-full bg-white" /> meses anteriores</span>
                        <span className="inline-flex items-center gap-1 text-primary-200"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_BLUE }} /> mes atual</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div>
                            <p className="text-2xl font-display font-bold text-white">
                                +{growthData[growthData.length - 1]?.count || 0}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
                                novos este mês
                            </p>
                        </div>
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>

                {/* Membros recentes */}
                <div className="card lg:col-span-2 p-0 overflow-hidden space-y-0">
                    <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus size={15} className="text-brand-primary" />
                            <h3 className="font-display text-sm font-semibold text-text-primary">Membros recentes</h3>
                        </div>
                        <Link
                            href="/admin/membros"
                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            Ver todos <ChevronRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1,2,3].map(i => <Skeleton key={i} variant="avatar" />)}
                        </div>
                    ) : !data?.recentMembers?.length ? (
                        <EmptyState icon={<Users size={20} />} title="Nenhum membro encontrado" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[380px] text-sm">
                                <thead>
                                    <tr className="bg-surface-section">
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Membro</th>
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5 hidden sm:table-cell">E-mail</th>
                                        <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Perfil</th>
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
                                                    href={`/admin/membros`}
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

            {/* ── Moderação de postagens pendentes ── */}
            <div className="card p-0 overflow-hidden space-y-0">
                <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={15} className="text-status-warning" />
                        <h3 className="font-display text-sm font-semibold text-text-primary">Postagens pendentes</h3>
                    </div>
                    {pendingPosts > 0 && (
                        <Badge variant="warning" dot>{pendingPosts} pendente{pendingPosts !== 1 ? "s" : ""}</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="p-4">
                        <Skeleton variant="table" lines={3} />
                    </div>
                ) : !data?.pendingPosts?.length ? (
                    <EmptyState
                        icon={<CheckCircle size={22} />}
                        title="Nenhuma postagem pendente"
                        description="Todas as postagens foram moderadas."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-sm">
                            <thead>
                                <tr className="bg-surface-section">
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Título</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Autor</th>
                                    <th className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Data</th>
                                    <th className="text-right text-[10px] font-bold text-text-muted uppercase tracking-wide px-4 py-2.5">Ações</th>
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
                                                {new Date(post.createdAt).toLocaleDateString("pt-BR")}
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
                                                    href={`/admin/postagens`}
                                                    className="p-1.5 bg-surface-subtle text-text-muted rounded-md hover:bg-surface-section hover:text-text-primary transition-all inline-flex"
                                                    title="Ver postagem"
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
