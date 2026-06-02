"use client";

import { useState, useEffect } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, Users, FileText, Heart,
    UserPlus, Activity, BarChart3, PieChart as PieIcon,
    Calendar, RefreshCw, Wifi
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";

/* ── Paleta de cores para gráficos ── */
const C_BLUE    = "#2563eb";
const C_CYAN    = "#0284c7";
const C_SUCCESS = "#059669";
const C_WARNING = "#d97706";
const C_ERROR   = "#dc2626";
const C_PURPLE  = "#7c3aed";

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

    const { stats = {}, trends = {} } = data || {};

    const loginData      = (trends.dailyLogins     || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const postsData      = (trends.dailyPosts       || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const newMembersData = (trends.dailyNewMembers  || []).map(d => ({ date: fmtDate(d.date), value: d.count }));
    const monthlyData    = (trends.monthlyGrowth    || []).map(d => ({ month: d.label || d.month, members: d.count }));
    const engagData      = (trends.engagement       || []).map(d => ({ date: fmtDate(d.date), likes: d.likes, comments: d.comments, followers: d.follows }));

    const postsStatus = [
        { name: "Approved", value: stats.approvedPosts || 0, color: C_SUCCESS },
        { name: "Pending",  value: stats.pendingPosts  || 0, color: C_WARNING },
        { name: "Rejected", value: stats.rejectedPosts || 0, color: C_ERROR   },
    ].filter(d => d.value > 0);

    const chartTabs = [
        { id: "logins",   label: "Access",      icon: Activity, data: loginData,      color: C_BLUE   },
        { id: "posts",    label: "Posts",     icon: FileText, data: postsData,      color: C_CYAN   },
        { id: "members",  label: "New Members", icon: UserPlus, data: newMembersData, color: C_PURPLE },
    ];
    const activeTab = chartTabs.find(t => t.id === activeChart) || chartTabs[0];

    const tooltipStyle = { fontSize: 12, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--surface-card)" };

    return (
        <div className="space-y-5">
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
                <KpiCard icon={FileText} label="Posts" value={stats.totalPosts}      iconBg="bg-status-pending-bg"    iconColor="text-status-pending" />
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
                                <Line type="monotone" dataKey="likes"       stroke={C_ERROR}   strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="comments" stroke={C_BLUE}    strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="followers"   stroke={C_SUCCESS} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Cards de totais por status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Approved Posts", value: stats.approvedPosts, bg: "bg-status-success",    text: "text-white" },
                    { label: "Pending",        value: stats.pendingPosts,  bg: "bg-status-warning",    text: "text-white" },
                    { label: "Rejected",       value: stats.rejectedPosts, bg: "bg-status-error",      text: "text-white" },
                    { label: "Webinars",            value: stats.webinars,      bg: "bg-brand-primary",     text: "text-white" },
                ].map(({ label, value, bg, text }) => (
                    <div key={label} className={`${bg} rounded-lg p-4 shadow-card`}>
                        <p className={`text-xs font-semibold ${text} opacity-80`}>{label}</p>
                        <p className={`text-2xl font-bold ${text} mt-1`}>{value ?? 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
