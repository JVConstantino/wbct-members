"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    FileText,
    Calendar,
    PlayCircle,
    TrendingUp,
    Clock,
    UserPlus,
    CheckCircle,
    Loader2,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    XCircle,
    Wifi,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const result = await res.json();
                if (result.success) {
                    setData(result);
                    // Usuários online vem da API (baseado em lastActiveAt)
                    setOnlineUsers(result.stats?.online || 0);
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Atualizar dados a cada 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600" size={48} />
                <p className="text-slate-500 font-bold text-sm mt-4">Loading...</p>
            </div>
        );
    }

    // Dados para o gráfico de status de posts
    const postStatusData = [
        { name: 'Approved', value: data?.stats?.approvedPosts || 12, color: '#10b981' },
        { name: 'Pending', value: data?.stats?.pendingPosts || 3, color: '#f59e0b' },
        { name: 'Rejected', value: data?.stats?.rejectedPosts || 1, color: '#ef4444' },
    ];

    const cards = [
        {
            title: "Members",
            value: data?.stats?.members || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            trend: "+12%",
            trendUp: true
        },
        {
            title: "Online Users",
            value: onlineUsers,
            icon: Wifi,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
            trend: "Now",
            trendUp: true,
            live: true
        },
        {
            title: "Pending",
            value: data?.stats?.pendingPosts || 0,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            trend: "Action",
            trendUp: false
        },
        {
            title: "Events",
            value: data?.stats?.upcomingEvents || 0,
            icon: Calendar,
            color: "text-violet-600",
            bg: "bg-violet-500/10",
            trend: "This month",
            trendUp: true
        },
    ];

    const loginHistory = data?.trends?.dailyLogins?.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        logins: item.count
    })) || [
            { name: 'Mon', logins: 12 },
            { name: 'Tue', logins: 19 },
            { name: 'Wed', logins: 15 },
            { name: 'Thu', logins: 22 },
            { name: 'Fri', logins: 30 },
            { name: 'Sat', logins: 18 },
            { name: 'Sun', logins: 10 },
        ];

    const growthData = data?.trends?.monthlyGrowth || [
        { month: 'Jan', count: 5 },
        { month: 'Feb', count: 8 },
        { month: 'Mar', count: 12 },
        { month: 'Apr', count: 15 },
    ];

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            {/* Header Compacto */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-4 md:p-6 rounded-xl border border-border-subtle">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
                        Dashboard
                    </h2>
                    <p className="text-slate-500 font-medium text-xs md:text-sm">
                        Platform Overview
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        {onlineUsers} online
                    </span>
                </div>
            </div>

            {/* Grid de Cards - Compacto */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {cards.map((card, i) => (
                    <div key={i} className="bg-surface-card p-4 md:p-5 rounded-xl border border-border-subtle hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 md:p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={16} className="md:w-5 md:h-5" />
                            </div>
                            {card.live && (
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            )}
                        </div>
                        <p className="text-text-muted font-bold text-[10px] md:text-xs uppercase tracking-wide">{card.title}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-text-primary">{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Gráficos - Layout Compacto */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Gráfico de Atividade */}
                <div className="lg:col-span-2 bg-surface-card rounded-xl p-4 md:p-6 border border-border-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm md:text-base font-black text-text-primary flex items-center gap-2">
                                <Activity className="text-brand-primary" size={16} />
                                Weekly Activity
                            </h3>
                            <p className="text-slate-400 text-xs">Logins per day</p>
                        </div>
                    </div>
                    <div className="h-[180px] md:h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={loginHistory}>
                                <defs>
                                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="logins"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorLogins)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Status de Posts */}
                <div className="bg-surface-card rounded-xl p-4 md:p-6 border border-border-subtle">
                    <h3 className="text-sm md:text-base font-black text-text-primary flex items-center gap-2 mb-4">
                        <FileText className="text-brand-primary" size={16} />
                        Post Status
                    </h3>
                    <div className="h-[160px] md:h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={postStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {postStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {postStatusData.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-text-muted font-medium">{item.name}</span>
                                <span className="font-bold text-text-primary">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Crescimento + Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Crescimento Mensal */}
                <div className="bg-slate-900 rounded-xl p-4 md:p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="text-primary-400" size={16} />
                        <h3 className="text-sm font-black">Growth</h3>
                    </div>
                    <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                                    {growthData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === growthData.length - 1 ? '#10b981' : 'rgba(255,255,255,0.1)'}
                                        />
                                    ))}
                                </Bar>
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                        <div>
                            <p className="text-2xl font-black">+{growthData[growthData.length - 1]?.count || 0}</p>
                            <p className="text-[10px] font-bold uppercase text-primary-400">new this month</p>
                        </div>
                        <TrendingUp className="text-primary-400" size={20} />
                    </div>
                </div>

                {/* Membros Recentes - Tabela Compacta */}
                <div className="lg:col-span-2 bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <h3 className="text-sm font-black flex items-center gap-2 text-text-primary">
                            <UserPlus className="text-blue-600" size={16} />
                            Recent Members
                        </h3>
                        <Link href="/admin/membros" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    {/* Tabela com scroll horizontal */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px]">
                            <thead className="bg-surface-subtle">
                                <tr>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2">Member</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2 hidden sm:table-cell">Email</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2">Role</th>
                                    <th className="text-right text-[10px] font-black text-text-muted uppercase px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {data?.recentMembers?.slice(0, 5).map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                    {member.name?.charAt(0) || "U"}
                                                </div>
                                                <span className="font-bold text-text-primary text-sm truncate max-w-[100px]">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-xs text-text-muted truncate max-w-[150px] block">{member.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                {member.role === "ADMIN" ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-1 text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Moderação de Posts - Compacto */}
            <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                    <h3 className="text-sm font-black flex items-center gap-2 text-text-primary">
                        <FileText className="text-amber-500" size={16} />
                        Pending Posts
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-bold">
                        {data?.stats?.pendingPosts || 0} PENDING
                    </span>
                </div>
                <div className="overflow-x-auto">
                    {!data?.pendingPosts?.length ? (
                        <div className="p-8 text-center">
                            <CheckCircle className="mx-auto text-emerald-400 mb-2" size={32} />
                            <p className="text-slate-500 font-bold text-sm">No pending posts!</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-surface-subtle">
                                <tr>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2">Title</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2">Author</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-2">Date</th>
                                    <th className="text-right text-[10px] font-black text-text-muted uppercase px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {data.pendingPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-text-primary text-sm truncate max-w-[200px] block">{post.title}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{post.authorName}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600" title="Approve">
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Reject">
                                                    <XCircle size={14} />
                                                </button>
                                                <Link href={`/admin/postagens/${post.id}`} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                                    <Eye size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
