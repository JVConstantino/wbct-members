"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard, Users, FileText, Calendar,
    PlayCircle, LogOut, User, ChevronRight,
    BookOpen, BarChart3, Settings,
    Menu, X, MessageSquare, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { Avatar } from "@/components/ui/Avatar";
import { useUser } from "@/contexts/UserContext";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard",    href: "/admin" },
    { icon: MessageSquare,   label: "Chat",         href: "/admin/chat" },
    { icon: BarChart3,       label: "Analytics",    href: "/admin/analytics" },
    { icon: Users,           label: "Members",      href: "/admin/members" },
    { icon: FileText,        label: "Posts",        href: "/admin/posts" },
    { icon: Calendar,        label: "Event Calendar", href: "/admin/events" },
    { icon: Calendar,        label: "Event Management", href: "/admin/events/management" },
    { icon: PlayCircle,      label: "Webinars",     href: "/admin/webinars" },
    { icon: BookOpen,        label: "Documentation", href: "/admin/docs" },
    { icon: Settings,        label: "Settings", href: "/admin/settings/email" },
    { icon: User,            label: "My Profile",   href: "/admin/profile" },
];

function forceLightTheme() {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
}

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { user } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        forceLightTheme();
        const media = window.matchMedia("(min-width: 1024px)");
        const updateMedia = () => setIsDesktop(media.matches);
        updateMedia();
        media.addEventListener("change", updateMedia);

        return () => media.removeEventListener("change", updateMedia);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [isDesktop]);

    useEffect(() => {
        const offset = isDesktop ? (desktopCollapsed ? 88 : 272) : 0;
        document.documentElement.style.setProperty("--shell-offset", `${offset}px`);
        return () => document.documentElement.style.setProperty("--shell-offset", "0px");
    }, [isDesktop, desktopCollapsed]);

    const userName  = session?.user?.name  || "Admin";
    const userImage = user?.image || "";
    const userEmail = session?.user?.email || "";
    const isCollapsed = isDesktop && desktopCollapsed;
    const sidebarWidth = isCollapsed ? 88 : 272;

    return (
        <div className="flex min-h-screen bg-surface-page transition-colors duration-300">

            {/* Overlay mobile */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-brand-strong/60 backdrop-blur-sm z-[60] lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                ref={sidebarRef}
                animate={{ width: sidebarWidth }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className={`fixed inset-y-0 left-0 z-[70] bg-surface-sidebar border-r border-border-default shadow-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none lg:pointer-events-auto"}`}
            >
                {/* Botão fechar mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 lg:hidden p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-md transition-colors"
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>

                <div className="h-16 px-4 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
                            <Image src="/logo.png" alt="WBCT" width={36} height={36} className="w-9 h-9 rounded-md object-cover" />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <p className="font-display text-base font-bold text-text-primary leading-none tracking-wide">WBCT ADMIN</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                                title={isCollapsed ? item.label : undefined}
                            >
                                <div className={`flex items-center min-w-0 ${isCollapsed ? "gap-0" : "gap-2.5"}`}>
                                    <item.icon
                                        size={16}
                                        className={active ? "text-white" : "text-text-muted group-hover:text-brand-primary transition-colors"}
                                    />
                                    {!isCollapsed && <span className={active ? "text-white" : ""}>{item.label}</span>}
                                </div>
                                {!isCollapsed && active && <ChevronRight size={13} className="text-white/70" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Usuário */}
                <div className="px-3 py-4 border-t border-border-default space-y-3">
                    <div className={`flex items-center px-2 ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                        <Avatar src={userImage} name={userName} size="sm" online />
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate leading-tight">{userName}</p>
                                <p className="text-[10px] text-text-muted truncate">{userEmail}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={`btn-ghost w-full px-2 py-2 text-xs text-status-error hover:bg-status-error-bg hover:text-status-error gap-2 ${isCollapsed ? "justify-center" : "justify-start"}`}
                        title={isCollapsed ? "Sign out" : undefined}
                    >
                        <LogOut size={14} />
                        {!isCollapsed && "Sign out"}
                    </button>
                </div>
            </motion.aside>

            {/* ── Main ── */}
            <motion.div
                className="flex-1 flex flex-col min-h-screen min-w-0"
                animate={{ marginLeft: isDesktop ? (desktopCollapsed ? 88 : 272) : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                style={{ marginLeft: 0 }}
            >

                {/* Header */}
                <header className="h-16 sticky top-0 z-40 bg-surface-header backdrop-blur-md border-b border-border-default flex items-center justify-between px-4 md:px-6">
                    {/* Mobile: menu + logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDesktopCollapsed((v) => !v)}
                            className="hidden lg:flex p-2 text-text-secondary hover:bg-surface-subtle rounded-md transition-colors border border-border-default"
                            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {desktopCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
                        </button>

                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="lg:hidden p-2 text-text-secondary hover:bg-surface-subtle rounded-md transition-colors border border-border-default"
                            aria-label="Open menu"
                        >
                            <Menu size={18} />
                        </button>
                    </div>

                    <div className="hidden md:block" />

                    {/* Actions direita */}
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />

                        <div className="hidden sm:block w-px h-6 bg-border-default mx-1" />

                        <Link
                            href="/admin/profile"
                            className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-subtle border border-transparent hover:border-border-default transition-all"
                        >
                            <Avatar src={userImage} name={userName} size="xs" />
                            <span className="text-sm font-medium text-text-primary">{userName.split(" ")[0]}</span>
                        </Link>
                    </div>
                </header>

                {/* Conteúdo */}
                <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </motion.div>
        </div>
    );
}
