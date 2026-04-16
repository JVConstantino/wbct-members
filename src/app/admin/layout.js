"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    FileText,
    Calendar,
    PlayCircle,
    LogOut,
    Bell,
    Settings,
    User,
    ChevronRight,
    Search,
    Sun,
    Moon,
    BookOpen,
    BarChart3,
    Menu,
    X,
    MessageSquare
} from "lucide-react";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: MessageSquare, label: "Chat", href: "/admin/chat" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Users, label: "Members", href: "/admin/membros" },
    { icon: FileText, label: "Posts", href: "/admin/postagens" },
    { icon: Calendar, label: "Events", href: "/admin/eventos" },
    { icon: PlayCircle, label: "WBCT Academy", href: "/admin/webinars" },
    { icon: BookOpen, label: "Documentation", href: "/admin/docs" },
    { icon: User, label: "My Profile", href: "/admin/perfil" },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [theme, setTheme] = useState("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (currentTheme) => {
        const root = document.documentElement;
        if (currentTheme === "dark") {
            root.classList.add("dark");
            root.setAttribute("data-theme", "dark");
        } else {
            root.classList.remove("dark");
            root.setAttribute("data-theme", "light");
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    };

    return (
        <div className="flex min-h-screen bg-surface-page font-sans transition-colors duration-300">
            {/* Overlay para mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop & Mobile Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-5 right-5 lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                            <PlayCircle className="text-white" size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white tracking-tighter leading-none">WBCT</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Admin Hub</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Menu</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={isActive ? "text-white" : "group-hover:text-brand-primary transition-colors"} />
                                    <span className="font-bold text-sm">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="text-white/60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section at Bottom */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-primary-700 flex items-center justify-center font-black text-sm text-white border-2 border-slate-800 shadow-md">
                                JC
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary-500 border-2 border-slate-900 rounded-full"></div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-white leading-none truncate">João Constantino</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Super Admin</span>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-xl font-bold text-xs transition-all border border-slate-700 hover:border-red-500/20"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 min-h-screen">
                {/* Header - Fixed */}
                <header className="h-16 bg-surface-card/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-text-secondary bg-surface-subtle rounded-xl border border-border-subtle"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                            <PlayCircle size={20} />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center bg-surface-subtle px-4 py-2 rounded-xl w-80 group focus-within:ring-2 ring-brand-primary/20 transition-all border border-transparent focus-within:border-brand-primary/30">
                        <Search size={16} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none px-3 text-sm font-medium w-full placeholder:text-text-muted text-text-primary"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-surface-subtle text-text-secondary rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-brand-primary transition-all border border-border-subtle"
                            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <button className="relative p-2.5 bg-surface-subtle text-text-secondary rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-brand-primary transition-all border border-border-subtle group">
                            <Bell size={18} className="group-hover:animate-bounce" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-card"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-border-subtle mx-1 hidden sm:block"></div>

                        <Link href="/admin/perfil" className="hidden sm:flex items-center gap-2 cursor-pointer p-1.5 pr-3 rounded-xl hover:bg-surface-subtle transition-all border border-transparent hover:border-border-default">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-xs text-white">
                                AD
                            </div>
                            <span className="text-sm font-bold text-text-primary">Admin</span>
                        </Link>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
