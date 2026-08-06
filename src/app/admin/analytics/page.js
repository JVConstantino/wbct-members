"use client";

import { useState, useEffect } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, Users, FileText, Heart,
    UserPlus, Activity, BarChart3, PieChart as PieIcon,
    Calendar, RefreshCw, Wifi, Stethoscope, GraduationCap,
    UserCheck, Award, Check, Clock, X
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";

/* ── Paleta de cores para gráficos ──
   Alinhada ao mapeamento de status usado em Badge.js / PostStatusBadge,
   para que "Pending" seja sempre roxo, "Approved/Active" verde e
   "Rejected/Blocked" vermelho em toda a aplicação (não só aqui). */
const C_BLUE    = "#2563eb"; // brand-primary
const C_CYAN    = "#0284c7"; // accent
const C_SUCCESS = "#059669"; // status-success (Approved / Active)
const C_WARNING = "#d97706"; // status-warning
const C_ERROR   = "#dc2626"; // status-error (Rejected / Blocked)
const C_PURPLE  = "#7c3aed"; // members chart accent
const C_PENDING = "#9333ea"; // status-pending (Pending)

const SPECIALTY_COLORS = [C_BLUE, C_CYAN, C_PURPLE, C_SUCCESS, C_WARNING, C_PENDING, "#64748b"];

const TIME_RANGES = [
    { key: "24h",  label: "24h" },
    { key: "48h",  label: "48h" },
    { key: "7d",   label: "7d" },
    { key: "30d",  label: "30d" },
    { key: "90d",  label: "90d" },
];

function fmtDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

/* ── KPI Card ── */
function KpiCard({ icon: Icon, label, value, iconBg, iconColor, valueColor }) {
    return (
        <div className="bg-surface-card border border-border-default rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-md ${iconBg}`}>
                    <Icon size={15} className={iconColor} />
                </div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${valueColor || "text-text-primary"}`}>{value ?? 0}</p>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData]         = useState(null);
    const [loading, setLoading]   = useState(true);
    const [activeChart, setActive] = useState("logins");
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState("7d");

    const fetchData = async (range) => {
        try {
            setRefreshing(true);
            const r = range || timeRange;
            const res    = await fetch(`/api/admin/stats?range=${r}`);
            const result = await res.json();
            if (result.success) setData(result);
        } catch (err) {
            console.error("Failed to fetch metrics:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const t = setInterval(fetchData, 60000);
        return () => clearInterval(t);
    }, []);

    const handleRangeChange = (range) => {
        setTimeRange(range);
        setLoading(true);
        fetchData(range);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    const { stats = {}, trends = {}, breakdowns = {}, topAuthors = [] } = data || {};

    const loginData      = (trends.dailyLogins     || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const postsData      = (trends.dailyPosts       || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const newMembersData = (trends.dailyNewMembers  || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const monthlyData    = (trends.monthlyGrowth    || []).map(d => ({ month: d.label || d.month, members: d.count }));
    const engagData      = (trends.engagement       || []).map(d => ({ date: fmtDate(d.date), comments: d.comments, follows: d.follows }));

    const postsStatus = [
        { name: "Approved", value: stats.approvedPosts || 0, color: C_SUCCESS },
        { name: "Pending",  value: stats.pendingPosts  || 0, color: C_PENDING },
        { name: "Rejected", value: stats.rejectedPosts || 0, color: C_ERROR   },
    ].filter(d => d.value > 0);

    const memberStatusColors = { APPROVED: C_SUCCESS, PENDING: C_PENDING, REJECTED: C_ERROR };
    const memberStatus = (breakdowns.memberStatus || []).map(d => ({ ...d, color: memberStatusColors[d.status] || C_BLUE }));

    const specialties = (breakdowns.specialties || []).map((d, i) => ({ ...d, color: SPECIALTY_COLORS[i % SPECIALTY_COLORS.length] }));

    const applicationTypeColors = { "Member": C_BLUE, "Academic Affiliate": C_CYAN };
    const applicationTypes = (breakdowns.applicationTypes || []).map(d => ({ ...d, color: applicationTypeColors[d.name] || C_PURPLE }));

    const chartTabs = [
        { id: "logins",   label: "Access",      icon: Activity, data: loginData,      color: C_BLUE   },
        { id: "posts",    label: "Posts",     icon: FileText, data: postsData,      color: C_CYAN   },
        { id: "members",  label: "New Members", icon: UserPlus, data: newMembersData, color: C_PURPLE },
    ];
    const activeTab = chartTabs.find(t => t.id === activeChart) || chartTabs[0];

    const tooltipStyle = { fontSize: 12, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--surface-card)" };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analytics"
                subtitle="Platform performance and engagement"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="flex bg-surface-subtle p-0.5 rounded-md">
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
                        <button
                            onClick={() => fetchData()}
                            disabled={refreshing}
                            className="btn-secondary gap-2 py-1.5 text-xs"
                        >
                            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Users}    label="Members"   value={stats.members}        iconBg="bg-brand-primary-light"  iconColor="text-brand-primary" />
                <KpiCard icon={Wifi}     label="Online"    value={stats.online}          iconBg="bg-status-success-bg"    iconColor="text-status-success" valueColor="text-status-success" />
                <KpiCard icon={FileText} label="Posts" value={stats.totalPosts}      iconBg="bg-accent-light"    iconColor="text-accent" />
                <KpiCard icon={Calendar} label="Events"   value={stats.upcomingEvents}  iconBg="bg-status-warning-bg"    iconColor="text-status-warning" />
            </div>

            {/* Gráfico principal com tabs */}
            <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                    <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <BarChart3 size={15} className="text-brand-primary" />
                        Weekly Activity
                    </h2>
                    <div className="flex bg-surface-subtle p-0.5 rounded-md">
                        {chartTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActive(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                                    activeChart === tab.id
                                        ? "bg-brand-primary text-white shadow-sm"
                                        : "text-text-muted hover:text-text-primary"
                                }`}
                            >
                                <tab.icon size={11} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4">
                    {activeTab.data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={activeTab.data}>
                                <defs>
                                    <linearGradient id={`grad-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={activeTab.color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={activeTab.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={activeTab.color}
                                    strokeWidth={2}
                                    fill={`url(#grad-${activeChart})`}
                                    name={activeTab.label}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-text-muted gap-2">
                            <Activity size={28} className="opacity-40" />
                            <p className="text-sm">No data for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtítulo de seção */}
            <div className="pb-1 border-b border-border-default">
                <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Content & Engagement</span>
            </div>

            {/* Gráficos secundários */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pizza — status de postagens */}
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <PieIcon size={14} className="text-brand-primary" />
                            Post Status
                        </h2>
                    </div>
                    <div className="p-4">
                        {postsStatus.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={postsStatus}
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={72}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {postsStatus.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {postsStatus.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-semibold text-text-muted">{item.name}: {item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
                                No posts yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly growth bars */}
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <TrendingUp size={14} className="text-brand-primary" />
                            Monthly Growth
                        </h2>
                    </div>
                    <div className="p-4">
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="members" fill={C_BLUE} radius={[4, 4, 0, 0]} name="New Members" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
                                Not enough data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Engajamento */}
            {engagData.length > 0 && (
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <Heart size={14} className="text-brand-primary" />
                            Community Engagement
                        </h2>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={engagData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                <Line type="monotone" dataKey="comments" name="Comments" stroke={C_BLUE} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="follows"  name="New Follows" stroke={C_CYAN} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Subtítulo de seção */}
            <div className="pb-1 border-b border-border-default">
                <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Membership</span>
            </div>

            {/* Composição da comunidade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Member status */}
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <UserCheck size={14} className="text-brand-primary" />
                            Member Status
                        </h2>
                    </div>
                    <div className="p-4">
                        {memberStatus.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={memberStatus}
                                            cx="50%" cy="50%"
                                            innerRadius={40} outerRadius={64}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {memberStatus.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {memberStatus.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-semibold text-text-muted">{item.name}: {item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-text-muted text-sm">
                                No members yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Specialties */}
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <Stethoscope size={14} className="text-brand-primary" />
                            Top Specialties
                        </h2>
                    </div>
                    <div className="p-4">
                        {specialties.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={specialties} layout="vertical" margin={{ left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Members">
                                        {specialties.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-text-muted text-sm">
                                No specialty data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Top authors */}
                <div className="bg-surface-card border border-border-default rounded-lg shadow-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-default">
                        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                            <Award size={14} className="text-brand-primary" />
                            Top Authors
                        </h2>
                    </div>
                    <div className="p-4">
                        {topAuthors.length > 0 ? (
                            <ul className="space-y-2.5">
                                {topAuthors.map((author, i) => (
                                    <li key={author.id} className="flex items-center gap-2.5">
                                        <span className="text-[11px] font-bold text-text-muted w-4 shrink-0">{i + 1}</span>
                                        <Avatar src={author.image} name={author.name} size="sm" />
                                        <span className="flex-1 min-w-0 text-xs font-semibold text-text-primary truncate">{author.name}</span>
                                        <span className="text-[11px] font-bold text-brand-primary shrink-0">{author.posts} post{author.posts !== 1 ? "s" : ""}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-text-muted text-sm">
                                No published posts yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application type */}
            {applicationTypes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {applicationTypes.map((item) => (
                        <div key={item.name} className="bg-surface-card border border-border-default rounded-lg shadow-card p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-md shrink-0" style={{ backgroundColor: `${item.color}1a` }}>
                                {item.name === "Academic Affiliate"
                                    ? <GraduationCap size={18} style={{ color: item.color }} />
                                    : <Stethoscope size={18} style={{ color: item.color }} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.name}</p>
                                <p className="text-xl font-bold text-text-primary">{item.count}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cards de totais por status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Check} label="Approved Posts" value={stats.approvedPosts} iconBg="bg-status-success-bg" iconColor="text-status-success" />
                <KpiCard icon={Clock} label="Pending Posts"  value={stats.pendingPosts}  iconBg="bg-status-pending-bg" iconColor="text-status-pending" />
                <KpiCard icon={X}     label="Rejected Posts" value={stats.rejectedPosts} iconBg="bg-status-error-bg"   iconColor="text-status-error" />
                <KpiCard icon={UserPlus} label="New Follows" value={stats.newFollows}    iconBg="bg-brand-primary-light" iconColor="text-brand-primary" />
            </div>
        </div>
    );
}
