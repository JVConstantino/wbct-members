"use client";

import { useState } from "react";
import {
    Book,
    Shield,
    Users,
    FileText,
    Settings,
    Info,
    CheckCircle,
    ArrowRight,
    HelpCircle,
    Calendar,
    MessageSquare,
    PlayCircle,
    User,
    Bell,
    Upload,
    Route,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const routeGroups = [
    {
        title: "Member routes",
        routes: [
            ["Main feed", "/member"],
            ["Articles", "/member/articles"],
            ["Member directory", "/member/directory"],
            ["Member profile", "/member/doctor/[id]"],
            ["Chat", "/member/chat"],
            ["Events", "/member/events"],
            ["My events", "/member/events/my-events"],
            ["Webinars", "/member/webinars"],
            ["Webinar details", "/member/webinars/[id]"],
            ["My posts", "/member/my-posts"],
            ["Post details", "/member/posts/[id]"],
            ["Create post", "/member/create"],
            ["Edit post", "/member/edit/post/[id]"],
            ["Profile", "/member/profile"],
        ],
    },
    {
        title: "Admin routes",
        routes: [
            ["Dashboard", "/admin"],
            ["Members", "/admin/members"],
            ["Posts", "/admin/posts"],
            ["New post", "/admin/posts/new"],
            ["Event calendar", "/admin/events"],
            ["Event management", "/admin/events/management"],
            ["Webinars", "/admin/webinars"],
            ["Analytics", "/admin/analytics"],
            ["Chat", "/admin/chat"],
            ["Email settings", "/admin/settings/email"],
            ["Profile", "/admin/profile"],
            ["Documentation", "/admin/docs"],
        ],
    },
    {
        title: "Public routes",
        routes: [
            ["Login", "/login"],
            ["Register", "/register"],
            ["Privacy policy", "/privacy-policy"],
            ["Terms of use", "/terms-of-use"],
        ],
    },
];

const sections = [
    {
        id: "overview",
        title: "Platform Overview",
        icon: Info,
        content: (
            <div className="space-y-6">
                <p className="text-text-secondary leading-relaxed">
                    WBCT is a private medical community platform with two protected areas: the admin panel and the member portal. Administrators approve users, moderate content, manage events, publish webinars, monitor analytics, and configure operational settings.                     Members access the community feed, publish articles, attend events, watch webinars, connect with members, and manage their profile.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-surface-subtle rounded-xl border border-border-default">
                        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2"><Shield size={18} className="text-brand-primary" /> Access Control</h4>
                        <p className="text-sm text-text-muted">Admin pages require the ADMIN role. Member pages require an authenticated and approved account.</p>
                    </div>
                    <div className="p-5 bg-surface-subtle rounded-xl border border-border-default">
                        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2"><Route size={18} className="text-brand-primary" /> English Routes</h4>
                        <p className="text-sm text-text-muted">The interface now uses English routes. Legacy Portuguese routes redirect to the new URLs for compatibility.</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "routes",
        title: "Route Map",
        icon: Route,
        content: (
            <div className="space-y-6">
                <p className="text-text-secondary">Use these URLs when documenting, bookmarking, or sharing internal links.</p>
                {routeGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <h3 className="text-lg font-bold text-text-primary">{group.title}</h3>
                        <div className="overflow-hidden rounded-xl border border-border-default">
                            {group.routes.map(([label, path]) => (
                                <div key={path} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 px-4 py-3 border-b border-border-subtle last:border-b-0 bg-surface-card">
                                    <span className="text-sm font-semibold text-text-primary">{label}</span>
                                    <code className="text-xs text-brand-primary bg-brand-primary-light px-2 py-1 rounded w-fit">{path}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: "admin",
        title: "Admin Panel Guide",
        icon: Settings,
        content: (
            <div className="space-y-5 text-text-secondary leading-relaxed">
                <Guide title="Dashboard" icon={Info}>Review key metrics, pending registrations, recent members, pending posts, and activity charts.</Guide>
                <Guide title="Members" icon={Users}>Search users, approve or block accounts, change roles, edit professional information, and update profile photos. Photos must be uploaded through the upload flow and saved as /uploads/... URLs.</Guide>
                <Guide title="Posts" icon={FileText}>Review submitted posts, approve or reject publication, preview content, and moderate comments.</Guide>
                <Guide title="Events" icon={Calendar}>Create events, manage the calendar, review participants, and update participant status.</Guide>
                <Guide title="Webinars" icon={PlayCircle}>Create courses, add lessons, upload cover images or attachments, reorder content, and publish educational materials.</Guide>
                <Guide title="Chat" icon={MessageSquare}>Communicate with members and search contacts from the admin interface.</Guide>
                <Guide title="Email Settings" icon={Settings}>Configure Resend credentials and sender details for transactional notifications.</Guide>
            </div>
        ),
    },
    {
        id: "member",
        title: "Member Portal Guide",
        icon: User,
        content: (
            <div className="space-y-5 text-text-secondary leading-relaxed">
                <Guide title="Main Feed" icon={FileText}>Members read approved posts, open articles, and access quick links for events and webinars.</Guide>
                <Guide title="Articles" icon={Book}>Browse community articles and search by topic or title.</Guide>
                <Guide title="Create and Edit Posts" icon={FileText}>Members submit articles with a title, image, and rich text content. New and edited posts enter the review queue before publication.</Guide>
                <Guide title="Member Directory" icon={Users}>Find members, open public profiles, follow professionals, request connections, and start conversations when permitted.</Guide>
                <Guide title="Events" icon={Calendar}>Browse the community calendar, confirm attendance, and track personal event participation.</Guide>
                <Guide title="Webinars" icon={PlayCircle}>Open courses, watch lessons, and mark lessons as completed.</Guide>
                <Guide title="Chat" icon={MessageSquare}>Send direct messages according to each member's privacy preferences.</Guide>
                <Guide title="Profile" icon={User}>Update name, medical license, specialty, biography, messaging preferences, profile photo, and privacy actions such as data export or account deletion.</Guide>
            </div>
        ),
    },
    {
        id: "uploads",
        title: "Profile Photos and Uploads",
        icon: Upload,
        content: (
            <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>Images and files are uploaded through <code className="text-brand-primary">/api/upload</code>. The API stores files in <code className="text-brand-primary">public/uploads</code> and returns a URL like <code className="text-brand-primary">/uploads/file.webp</code>.</p>
                <ul className="space-y-3">
                    <Checklist>Never store base64 images in user profiles.</Checklist>
                    <Checklist>Profile image fields must contain a URL, not a data URI.</Checklist>
                    <Checklist>Allowed image formats include JPG, PNG, WebP, GIF, HEIC, and HEIF.</Checklist>
                    <Checklist>The upload limit is 5 MB.</Checklist>
                    <Checklist>If an old account has a base64 image, upload a new image to replace it with a proper URL.</Checklist>
                </ul>
            </div>
        ),
    },
    {
        id: "notifications",
        title: "Notifications and Messaging",
        icon: Bell,
        content: (
            <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>The notification dropdown shows unread messages, post moderation results, and system updates. Notifications are polled periodically while the user is logged in.</p>
                <p>Messaging permissions are controlled from the member profile. Members can allow messages from everyone, followers, connections, or nobody.</p>
            </div>
        ),
    },
    {
        id: "troubleshooting",
        title: "Troubleshooting",
        icon: HelpCircle,
        content: (
            <div className="space-y-4 text-text-secondary leading-relaxed">
                <Checklist>If the browser shows an empty response, check for oversized cookies and clear legacy session cookies.</Checklist>
                <Checklist>If login redirects to an old port, delete the stale callback URL cookie and verify AUTH_URL.</Checklist>
                <Checklist>If avatars do not show, confirm the user image field starts with /uploads/ or a valid external URL.</Checklist>
                <Checklist>If a member cannot access the portal, confirm the account status is APPROVED.</Checklist>
                <Checklist>If admin pages redirect away, confirm the user's role is ADMIN.</Checklist>
            </div>
        ),
    },
];

function Guide({ title, icon: Icon, children }) {
    return (
        <div className="p-4 bg-surface-subtle rounded-xl border border-border-default">
            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2"><Icon size={17} className="text-brand-primary" /> {title}</h4>
            <p className="text-sm">{children}</p>
        </div>
    );
}

function Checklist({ children }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle size={18} className="text-status-success mt-0.5 shrink-0" />
            <span>{children}</span>
        </li>
    );
}

export default function AdminDocsPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const active = sections.find((section) => section.id === activeSection) || sections[0];
    const ActiveIcon = active.icon;

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            <PageHeader title="Documentation" subtitle="Complete operating guide for the WBCT platform" />

            <div className="relative rounded-2xl bg-brand-strong p-6 md:p-8 overflow-hidden shadow-xl border border-border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/25 to-transparent" />
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
                            <Book className="text-white" size={18} />
                        </div>
                        <span className="text-xs font-black text-primary-200 uppercase tracking-[0.15em]">Admin Manual</span>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black !text-white tracking-tight leading-tight">
                        System usage, route map, admin workflows, member workflows, uploads, and troubleshooting.
                    </h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-32 space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all text-left ${isActive ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"}`}
                                >
                                    <Icon size={18} />
                                    {section.title}
                                </button>
                            );
                        })}
                        <hr className="my-6 border-border-subtle" />
                        <div className="p-5 bg-surface-subtle rounded-xl border border-border-subtle">
                            <HelpCircle size={24} className="text-brand-primary mb-3" />
                            <h4 className="text-sm font-black text-text-primary mb-2">Need support?</h4>
                            <p className="text-xs text-text-muted leading-relaxed mb-4">Contact the technical team for advanced infrastructure or deployment questions.</p>
                            <a href="mailto:info@wbctsociety.org" className="text-xs font-black text-brand-primary hover:underline flex items-center gap-1">
                                Send email <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 bg-surface-card rounded-2xl border border-border-subtle p-6 md:p-10 shadow-sm min-h-[500px]">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-8">
                            <ActiveIcon size={32} className="text-brand-primary" />
                            <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">{active.title}</h2>
                        </div>
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {active.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
