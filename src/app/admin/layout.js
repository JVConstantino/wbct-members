"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard, Users, FileText, Calendar,
    PlayCircle, LogOut, Bell, User, ChevronRight,
    Search, Sun, Moon, BookOpen, BarChart3,
    Menu, X, MessageSquare, Stethoscope
} from "lucide-react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Avatar } from "@/components/ui/Avatar";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard",    href: "/admin" },
    { icon: MessageSquare,   label: "Chat",         href: "/admin/chat" },
    { icon: BarChart3,       label: "Analytics",    href: "/admin/analytics" },
    { icon: Users,           label: "Membros",      href: "/admin/membros" },
    { icon: FileText,        label: "Postagens",    href: "/admin/postagens" },
    { icon: Calendar,        label: "Eventos",      href: "/admin/eventos" },
    { icon: PlayCircle,      label: "WBCT Academy", href: "/admin/webinars" },
    { icon: BookOpen,        label: "Documentação", href: "/admin/docs" },
    { icon: User,            label: "Meu Perfil",   href: "/admin/perfil" },
];

function applyTheme(t) {
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.setAttribute("data-theme", t);
}

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [theme, setTheme] = useState("light");
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        const saved = localStorage.getItem("theme")
            || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(saved);
        applyTheme(saved);
    }, []);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        applyTheme(next);
    };

    const userName  = session?.user?.name  || "Admin";
    const userImage = session?.user?.image || "";
    const userEmail = session?.user?.email || "";

    return (
        <div className="flex min-h-screen bg-surface-page transition-colors duration-300">

            {/* Overlay mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-brand-strong/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`
                fixed inset-y-0 left-0 z-[60] w-64
                bg-surface-sidebar border-r border-border-default shadow-sidebar
                flex flex-col transition-transform duration-300
                lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Botão fechar mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 lg:hidden p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-md transition-colors"
                    aria-label="Fechar menu"
                >
                    <X size={18} />
                </button>

                {/* Logo */}
                <div className="px-5 py-5 border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center shadow-button-primary shrink-0">
                            <Stethoscope size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-display text-base font-bold text-text-primary leading-none">WBCT</p>
                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <p className="px-3 mb-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Menu principal</p>
                    {menuItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
                                    active
                                        ? "bg-brand-primary text-white shadow-sm"
                                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <item.icon
                                        size={16}
                                        className={active ? "text-white" : "text-text-muted group-hover:text-brand-primary transition-colors"}
                                    />
                                    {item.label}
                                </div>
                                {active && <ChevronRight size={13} className="text-white/70" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Usuário */}
                <div className="px-3 py-4 border-t border-border-default space-y-3">
                    <div className="flex items-center gap-2.5 px-2">
                        <Avatar src={userImage} name={userName} size="sm" online />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate leading-tight">{userName}</p>
                            <p className="text-[10px] text-text-muted truncate">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="btn-ghost w-full justify-start px-2 py-2 text-xs text-status-error hover:bg-status-error-bg hover:text-status-error gap-2"
                    >
                        <LogOut size={14} />
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

                {/* Header */}
                <header className="h-14 sticky top-0 z-40 bg-surface-header backdrop-blur-md border-b border-border-default flex items-center justify-between px-4 md:px-6">
                    {/* Mobile: menu + logo */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 text-text-secondary hover:bg-surface-subtle rounded-md transition-colors border border-border-default"
                            aria-label="Abrir menu"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="w-7 h-7 bg-brand-primary rounded-md flex items-center justify-center">
                            <Stethoscope size={15} className="text-white" />
                        </div>
                    </div>

                    {/* Busca */}
                    <div className="hidden md:flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-md border border-border-default w-72 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary-ring transition-all">
                        <Search size={14} className="text-text-muted shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted text-text-primary"
                        />
                    </div>

                    {/* Ações direita */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-text-secondary hover:bg-surface-subtle hover:text-brand-primary rounded-md transition-colors border border-border-default"
                            aria-label={theme === "light" ? "Modo escuro" : "Modo claro"}
                        >
                            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        <NotificationDropdown />

                        <div className="hidden sm:block w-px h-6 bg-border-default mx-1" />

                        <Link
                            href="/admin/perfil"
                            className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-subtle border border-transparent hover:border-border-default transition-all"
                        >
                            <Avatar src={userImage} name={userName} size="xs" />
                            <span className="text-sm font-medium text-text-primary">{userName.split(" ")[0]}</span>
                        </Link>
                    </div>
                </header>

                {/* Conteúdo */}
                <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
