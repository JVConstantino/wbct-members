"use client";

import { useState } from "react";
import {
    Book,
    Shield,
    Zap,
    Users,
    FileText,
    Settings,
    Info,
    CheckCircle,
    ArrowRight,
    HelpCircle,
    Key
} from "lucide-react";

export default function AdminDocsPage() {
    const [activeSection, setActiveSection] = useState("overview");

    const sections = [
        {
            id: "overview",
            title: "Overview",
            icon: Info,
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Welcome to the official WBCT platform documentation. This guide was created exclusively for Super Admins to assist in efficient management of the system, users, and contents.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-surface-subtle rounded-2xl border border-border-default">
                            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Shield size={18} className="text-brand-primary" />
                                Priority Security
                            </h4>
                            <p className="text-sm text-text-muted">Access restricted via RBAC (Role Based Access Control). Only ADMIN role users view this panel.</p>
                        </div>
                        <div className="p-6 bg-surface-subtle rounded-2xl border border-border-default">
                            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Zap size={18} className="text-brand-primary" />
                                Performance
                            </h4>
                            <p className="text-sm text-text-muted">The system uses Next.js 15 with Turbopack for ultra-fast rendering and image optimization.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "members",
            title: "Member Management",
            icon: Users,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">User Control</h3>
                    <p className="text-text-secondary leading-relaxed">
                        In the "Members" menu, you can view all registered users, edit profiles, and change permissions.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-status-success mt-0.5" />
                            <span className="text-text-secondary"><strong className="text-text-primary">Approval:</strong> New registrations can be filtered by status.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-status-success mt-0.5" />
                            <span className="text-text-secondary"><strong className="text-text-primary">Roles:</strong> You can promote a member to ADMIN to share moderation tasks.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            id: "posts",
            title: "Post Moderation",
            icon: FileText,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Articles HUB</h3>
                    <p className="text-text-secondary">All posts created by doctors pass through your moderation before going public.</p>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                            Important: Approved articles trigger automatic notifications to author followers.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "system",
            title: "System Settings",
            icon: Settings,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Variables and Environment</h3>
                    <p className="text-text-secondary">The system is connected to a robust MySQL database. We certify that:</p>
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                        # Technical configuration example<br />
                        DATABASE_URL="mysql://un:pw@host:port/db"<br />
                        NEXTAUTH_SECRET="chave-de-seguranca"
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="relative rounded-2xl bg-slate-900 p-6 md:p-8 overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
                            <Book className="text-white" size={18} />
                        </div>
                        <span className="text-xs font-black text-brand-primary uppercase tracking-[0.15em]">SuperAdmin Manual</span>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black !text-white tracking-tight max-w-xl leading-tight">
                        Platform Documentation and <span className="text-brand-primary">Guidelines</span>.
                    </h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-32 space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all text-left ${isActive
                                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {section.title}
                                </button>
                            );
                        })}
                        <hr className="my-6 border-border-subtle" />
                        <div className="p-6 bg-surface-subtle rounded-3xl border border-border-subtle">
                            <HelpCircle size={24} className="text-brand-primary mb-3" />
                            <h4 className="text-sm font-black text-text-primary mb-2">Need support?</h4>
                            <p className="text-xs text-text-muted leading-relaxed mb-4">Contact the development team for advanced technical questions.</p>
                            <a href="mailto:suporte@wbct.com" className="text-xs font-black text-brand-primary hover:underline flex items-center gap-1">
                                Send Email <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 bg-surface-card rounded-3xl border border-border-subtle p-8 md:p-12 shadow-sm min-h-[500px]">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-8">
                            {(() => {
                                const activeIcon = sections.find(s => s.id === activeSection)?.icon || Info;
                                const IconComp = activeIcon;
                                return <IconComp size={32} className="text-brand-primary" />;
                            })()}
                            <h2 className="text-3xl font-black text-text-primary tracking-tight">
                                {sections.find(s => s.id === activeSection)?.title}
                            </h2>
                        </div>
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {sections.find(s => s.id === activeSection)?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
