"use client";

import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Lock,
    Stethoscope,
    Briefcase,
    Heart,
    Save,
    Camera,
    Bell,
    FileText,
    GraduationCap,
    UserPlus2,
    Upload,
    RefreshCw,
    Users,
    ShieldCheck
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";
import { Badge, statusToVariant } from "@/components/ui/Badge";
import { DocumentsList } from "@/components/ui/DocumentsList";

const TABS = [
    { id: "dados", icon: User, label: "Personal Details" },
    { id: "aplicacao", icon: FileText, label: "My Application" },
    { id: "seguranca", icon: Lock, label: "Security & Password" },
    { id: "notificacoes", icon: Bell, label: "Notifications" },
    { id: "rede", icon: Users, label: "Network" },
    { id: "privacidade", icon: ShieldCheck, label: "Privacy & Data" },
];

const STATUS_LABELS = { PENDING: "Pending", APPROVED: "Active", REJECTED: "Rejected" };

function applicationTypeBadge(type) {
    if (type === "ACADEMIC_AFFILIATE") {
        return <Badge variant="brand" className="gap-1"><GraduationCap size={9} />Academic Affiliate</Badge>;
    }
    return <Badge variant="info" className="gap-1"><UserPlus2 size={9} />Member</Badge>;
}

export default function MemberProfile() {
    const { updateUser } = useUser();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("dados");
    const [formData, setFormData] = useState({ name: "", email: "", specialty: "", crm: "", bio: "", image: "", allowMessagesFrom: "followers" });
    const [imageFailed, setImageFailed] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [notifications, setNotifications] = useState({ emailPosts: true, emailEvents: true, emailNewsletter: false, pushMessages: true });
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [deletePassword, setDeletePassword] = useState("");
    const [applicationDocuments, setApplicationDocuments] = useState(null);
    const [docUploading, setDocUploading] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user?.id) {
                    const userRes = await fetch(`/api/users/profile/${session.user.id}`);
                    const userData = await userRes.json();
                    if (userData.success) {
                        setUser(userData.user);
                        setApplicationDocuments(userData.user.applicationDocuments || null);
                        setFormData({
                            name: userData.user.name || "",
                            email: userData.user.email || "",
                            specialty: userData.user.specialty || "",
                            crm: userData.user.crm || "",
                            bio: userData.user.bio || "",
                            image: userData.user.image || "",
                            allowMessagesFrom: userData.user.allowMessagesFrom || "followers"
                        });
                        setImageFailed(false);
                    }
                }

                const [reqRes, connRes] = await Promise.all([
                    fetch("/api/users/connect/requests").catch(() => null),
                    fetch("/api/users/connections").catch(() => null),
                ]);
                if (reqRes) {
                    const reqData = await reqRes.json();
                    if (reqData.success) setConnectionRequests(reqData.requests || []);
                }
                if (connRes) {
                    const connData = await connRes.json();
                    if (connData.success) setConnections(connData.connections || []);
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
                setImageFailed(false);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleReplaceDocument = async (docKey, file, currentUrl) => {
        if (!file) return;
        setDocUploading((prev) => ({ ...prev, [docKey]: true }));
        try {
            const isPicture = docKey === "picture";
            const folderMatch = typeof currentUrl === "string" ? currentUrl.match(/\/uploads\/applications\/([^/]+)\//) : null;

            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("kind", isPicture ? "image" : "doc");
            if (folderMatch) uploadData.append("applicationId", folderMatch[1]);

            const uploadRes = await fetch("/api/upload?context=application", { method: "POST", body: uploadData });
            const uploadResult = await uploadRes.json();
            if (!uploadResult.success) throw new Error(uploadResult.error || "Upload failed.");

            const patchRes = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docKey, url: uploadResult.url }),
            });
            const patchResult = await patchRes.json();
            if (!patchResult.success) throw new Error(patchResult.error || "Could not update the document.");

            setApplicationDocuments(patchResult.applicationDocuments);
        } catch (err) {
            console.error("Failed to replace document:", err);
            alert(err.message || "Could not update the document.");
        } finally {
            setDocUploading((prev) => ({ ...prev, [docKey]: false }));
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };

            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                updateUser(payload);
                alert("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const respondRequest = async (requesterId, action) => {
        await fetch("/api/users/connect/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requesterId, action }),
        });
        setConnectionRequests((prev) => prev.filter((r) => r.requesterId !== requesterId));
        const connRes = await fetch("/api/users/connections");
        const connData = await connRes.json();
        if (connData.success) setConnections(connData.connections || []);
    };

    const handleExportData = async () => {
        const res = await fetch("/api/users/profile/export");
        const data = await res.json();
        if (!data.success) return alert(data.error || "Could not export data");
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wbct-data-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return alert("Enter your password to delete your account.");
        if (!confirm("This action is irreversible. Do you really want to permanently delete your account?")) return;
        const res = await fetch("/api/users/profile", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: deletePassword })
        });
        const data = await res.json();
        if (data.success) {
            alert("Account deleted successfully.");
            window.location.href = "/login";
        } else {
            alert(data.error || "Could not delete the account.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Syncing your data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-8 px-3 sm:px-0">
            {/* Header / Capa */}
            <div className="relative rounded-lg bg-brand-strong overflow-hidden shadow-card-hover">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#2563eb33,transparent_60%)]" />
                <div className="relative pt-8 sm:pt-10 pb-5 sm:pb-6 px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5">
                    {/* Avatar com upload */}
                    <div className="relative group flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-card p-1 shadow-modal overflow-hidden">
                            {uploading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Spinner size="md" />
                                </div>
                            ) : formData.image && !imageFailed ? (
                                <img
                                    src={formData.image}
                                    alt={formData.name}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                    <div className="w-full h-full rounded-md bg-brand-primary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                                    {formData.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 p-2 bg-brand-primary text-white rounded-md shadow-sm hover:scale-105 transition-transform cursor-pointer">
                            <Camera size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    {/* Nome e Info */}
                    <div className="flex-1 text-center sm:text-left pb-1">
                        <h1 className="text-xl sm:text-2xl font-display font-bold !text-white break-words">{formData.name || "Your Name"}</h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className="flex items-center gap-1 bg-brand-primary/20 text-white px-2.5 py-1 rounded text-xs font-bold uppercase">
                                <Stethoscope size={11} /> Member
                            </span>
                            {formData.specialty && (
                                <span className="!text-white text-xs">{formData.specialty}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
                {/* Sidebar de Navegação */}
                <div className="lg:w-64 shrink-0 space-y-3">
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-2 space-y-1 overflow-x-auto lg:overflow-visible flex lg:block gap-1 lg:gap-0">
                        {TABS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full min-w-[200px] lg:min-w-0 flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md font-semibold text-sm transition-all shrink-0 ${activeTab === item.id
                                    ? "bg-brand-primary text-white shadow-button-primary"
                                    : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"}`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-5 bg-brand-strong rounded-lg !text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest !text-white mb-1.5">Your Contribution</p>
                        <h4 className="text-sm font-bold leading-tight mb-2 !text-white">Keep your profile complete.</h4>
                        <p className="text-xs !text-white leading-relaxed">
                            A detailed profile increases your visibility in the community and makes networking easier.
                        </p>
                    </div>
                </div>

                {/* Área de Content */}
                <div className="flex-1 min-w-0">
                    {/* Tab: Dados Pessoais */}
                    {activeTab === "dados" && (
                        <form onSubmit={handleSave} className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                Professional Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                        <input name="name" className="input !pl-10" value={formData.name} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                        <input name="email" className="input !pl-10 opacity-60 cursor-not-allowed" value={formData.email} readOnly />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Medical Specialty</label>
                                    <div className="relative">
                                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                        <input name="specialty" className="input !pl-10" placeholder="E.g. Cardiology, Pediatrics..." value={formData.specialty} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Registration</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                        <input name="crm" className="input !pl-10" placeholder="Ex: Registration/SP 123456" value={formData.crm} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">My Biography</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-text-muted" size={15} />
                                    <textarea name="bio" className="input !pl-10 min-h-[100px] resize-none" value={formData.bio} onChange={handleChange} placeholder="Tell the community about your education and experience..." />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2 disabled:opacity-50">
                                {saving ? <Spinner size="sm" /> : <><Save size={15} /> Save Changes</>}
                            </button>
                        </form>
                    )}

                    {/* Tab: My Application */}
                    {activeTab === "aplicacao" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                            <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-4">
                                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                    <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                    Application Status
                                </h3>

                                <div className="flex flex-wrap items-center gap-2">
                                    {user?.status && (
                                        <Badge variant={statusToVariant[user.status] || "neutral"}>
                                            {STATUS_LABELS[user.status] || user.status}
                                        </Badge>
                                    )}
                                    {applicationTypeBadge(user?.applicationType)}
                                </div>

                                {user?.status === "PENDING" && (
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Your application is under review by the WBCT team. You will be notified as soon as it is validated.
                                    </p>
                                )}

                                {user?.status === "REJECTED" && (
                                    <div className="p-3 rounded-md bg-status-error-bg border border-status-error/20 space-y-1">
                                        <p className="text-xs font-semibold text-status-error">Application rejected</p>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {user.rejectionReason || "No reason was provided. Please contact support for details."}
                                        </p>
                                    </div>
                                )}

                                {user?.status === "APPROVED" && (
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Your application has been approved. Below are the documents you submitted during registration.
                                    </p>
                                )}
                            </div>

                            <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-4">
                                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                    <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                    Submitted Documents
                                </h3>

                                <DocumentsList
                                    docs={applicationDocuments}
                                    applicationType={user?.applicationType}
                                    renderExtra={(entry) => (
                                        <label className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 cursor-pointer ${docUploading[entry.key] ? "text-text-muted" : "text-brand-primary hover:underline"}`}>
                                            {docUploading[entry.key] ? (
                                                <RefreshCw size={11} className="animate-spin" />
                                            ) : (
                                                <Upload size={11} />
                                            )}
                                            Replace
                                            <input
                                                type="file"
                                                className="hidden"
                                                disabled={docUploading[entry.key]}
                                                accept={entry.key === "picture" ? "image/*" : ".pdf,.doc,.docx"}
                                                onChange={(e) => handleReplaceDocument(entry.key, e.target.files?.[0], entry.url)}
                                            />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab: Segurança */}
                    {activeTab === "seguranca" && (
                        <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                Security & Password
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: "currentPassword", label: "Current Password", placeholder: "Enter your current password" },
                                    { key: "newPassword", label: "New Password", placeholder: "Enter a new password" },
                                    { key: "confirmPassword", label: "Confirm New Password", placeholder: "Confirm the new password" },
                                ].map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{field.label}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                            <input
                                                type="password"
                                                className="input !pl-10"
                                                placeholder={field.placeholder}
                                                value={passwordData[field.key]}
                                                onChange={e => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2">
                                <Save size={15} /> Change Password
                            </button>
                        </div>
                    )}

                    {/* Tab: Notificações */}
                    {activeTab === "notificacoes" && (
                        <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                Notification Preferences
                            </h3>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                {[
                                    { key: "emailPosts", label: "New Posts", desc: "Receive email when new posts are published" },
                                    { key: "emailEvents", label: "Events & Webinars", desc: "Notifications about events and live classes" },
                                    { key: "emailNewsletter", label: "Weekly Newsletter", desc: "Weekly summary of the best publications" },
                                    { key: "pushMessages", label: "Direct Messages", desc: "Alerts when someone sends you a message" },
                                ].map(item => (
                                    <div key={item.key} className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-surface-subtle rounded-md border border-border-subtle">
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                                            <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? "bg-brand-primary" : "bg-border-default"}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[item.key] ? "left-6" : "left-1"}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Who can send me messages</label>
                                <select
                                    className="input"
                                    value={formData.allowMessagesFrom}
                                    onChange={(e) => setFormData((p) => ({ ...p, allowMessagesFrom: e.target.value }))}
                                >
                                    <option value="everyone">Everyone</option>
                                    <option value="followers">Followers only</option>
                                    <option value="connections">Connections only</option>
                                    <option value="nobody">Nobody</option>
                                </select>
                            </div>

                            <button onClick={handleSave} className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2" type="button">
                                <Save size={15} /> Save Preferences
                            </button>
                        </div>
                    )}

                    {/* Tab: Network */}
                    {activeTab === "rede" && (
                        <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                Network
                            </h3>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Connection requests</p>
                                {connectionRequests.length === 0 ? (
                                    <p className="text-xs text-text-muted">No pending requests.</p>
                                ) : connectionRequests.map((req) => (
                                    <div key={req.requesterId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-subtle rounded-md border border-border-subtle">
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">{req.name}</p>
                                            <p className="text-xs text-text-muted">{req.email}</p>
                                        </div>
                                        <div className="flex w-full sm:w-auto gap-2">
                                            <button type="button" onClick={() => respondRequest(req.requesterId, "reject")} className="btn-secondary text-xs flex-1 sm:flex-none">Decline</button>
                                            <button type="button" onClick={() => respondRequest(req.requesterId, "accept")} className="btn-primary text-xs flex-1 sm:flex-none">Accept</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-3 border-t border-border-subtle">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">My connections</p>
                                {connections.length === 0 ? (
                                    <p className="text-xs text-text-muted">You do not have connections yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {connections.map((conn) => (
                                            <div key={conn.id} className="p-2.5 rounded-md bg-surface-subtle border border-border-subtle">
                                                <p className="text-sm font-semibold text-text-primary">{conn.name}</p>
                                                <p className="text-xs text-text-muted">{conn.email}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Privacy & Data */}
                    {activeTab === "privacidade" && (
                        <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 sm:p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                <div className="w-0.5 h-5 bg-brand-primary rounded-full" />
                                Privacy & Data (LGPD / GDPR)
                            </h3>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Your data</p>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Download a copy of all personal data associated with your account.
                                </p>
                                <button type="button" onClick={handleExportData} className="btn-secondary text-xs">Download my data (JSON)</button>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-border-subtle">
                                <p className="text-xs font-semibold text-status-error uppercase tracking-wider">Danger zone</p>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                                <div className="space-y-2 w-full sm:max-w-sm">
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter your password to delete your account"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                    />
                                    <button type="button" onClick={handleDeleteAccount} className="btn-danger text-xs">Delete my account (Hard Delete)</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
