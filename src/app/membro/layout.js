"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Home,
    BookOpen,
    PlusSquare,
    Calendar,
    PlayCircle,
    User,
    LogOut,
    Menu,
    X,
    FileText,
    ChevronRight,
    Search,
    Cpu,
    MessageSquare
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const menuItems = [
    { icon: Home, label: "Main Feed", href: "/membro" },
    { icon: BookOpen, label: "Articles HUB", href: "/membro/blog" },
    { icon: User, label: "Medical Directory", href: "/membro/diretorio" },
    { icon: MessageSquare, label: "Messages", href: "/membro/chat" },
    { icon: Calendar, label: "Schedule", href: "/membro/eventos" },
    { icon: PlayCircle, label: "Courses & Classes", href: "/membro/webinars" },
    { icon: FileText, label: "My Posts", href: "/membro/minhas-postagens" },
    { icon: PlusSquare, label: "New Content", href: "/membro/criar" },
];

export default function MemberLayoutContent({ children }) {
    const pathname = usePathname();
    const { user } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Load saved theme
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

    // Activity ping for online user tracking
    useEffect(() => {
        const pingActivity = async () => {
            try {
                await fetch('/api/activity', { method: 'POST' });
            } catch (e) {
                // Silent ping errors
            }
        };

        // Initial ping
        pingActivity();

        // Ping every 2 minutes
        const interval = setInterval(pingActivity, 120000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex min-h-screen bg-surface-page font-sans transition-colors duration-300">
            {/* Sidebar - Desktop & Mobile Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:flex lg:translate-x-0'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-6 right-6 lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                            <Cpu className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter leading-none">WBCT</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Student Area</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Doctor Panel</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-brand-primary transition-colors"} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="text-primary-200" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section at Bottom */}
                <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center font-black text-lg border-2 border-slate-800 shadow-lg overflow-hidden">
                                {user?.image ? (
                                    <img src={user.image} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || "M"
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 border-4 border-slate-900 rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white leading-none truncate max-w-[140px]">{user?.name || "Member"}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{user?.stack || "Doctor"}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-xl font-bold text-xs transition-all border border-slate-700 hover:border-red-500/20"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen">
                {/* Header - Fixed */}
                <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                            <Cpu size={24} />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-2xl w-96 group focus-within:ring-2 ring-primary-500/20 transition-all border border-transparent focus-within:border-primary-500/30">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search in hub..."
                            className="bg-transparent border-none outline-none px-3 text-sm font-medium w-full placeholder:text-slate-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-colors"
                        >
                            {/* Theme Icon logic could be added here if icon imported */}
                        </button>
                    </div>
                </header>

                {/* Internal Page Padding */}
                <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
