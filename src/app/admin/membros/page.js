"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search, UserCheck, UserX, Eye, UserPlus,
    X, Check, ShieldAlert, FileText, Stethoscope,
    Briefcase, Mail, Save, Edit2, Lock, Upload,
    GraduationCap, UserPlus2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Skeleton";
import { DocumentsList } from "@/components/ui/DocumentsList";

function statusBadge(status) {
    if (status === "PENDING")  return <Badge variant="warning"  className="gap-1"><ShieldAlert size={9} />Pending</Badge>;
    if (status === "APPROVED") return <Badge variant="success"  className="gap-1"><Check size={9} />Active</Badge>;
    return                            <Badge variant="error"    className="gap-1"><UserX size={9} />Blocked</Badge>;
}

function roleBadge(role) {
    return role === "ADMIN"
        ? <Badge variant="info">Admin</Badge>
        : <Badge variant="neutral">Member</Badge>;
}

function applicationTypeBadge(type) {
    if (type === "ACADEMIC_AFFILIATE") {
        return <Badge variant="brand" className="gap-1"><GraduationCap size={9} />Academic Affiliate</Badge>;
    }
    return <Badge variant="info" className="gap-1"><UserPlus2 size={9} />Member</Badge>;
}

function fmtDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MembersPage() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch]               = useState("");
    const [members, setMembers]             = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState("");
    const [selected, setSelected]           = useState(null);
    const [isEditing, setIsEditing]         = useState(false);
    const [editForm, setEditForm]           = useState({});
    const [editImage, setEditImage]         = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showCreate, setShowCreate]       = useState(false);
    const [creating, setCreating]           = useState(false);
    const [newMember, setNewMember]         = useState({ name: "", email: "", password: "", role: "MEMBER" });
    const [selectedIds, setSelectedIds]     = useState([]);
    const [rejectModal, setRejectModal]     = useState(null);
    const [rejectReason, setRejectReason]   = useState("");

    const fetchMembers = async (q = "") => {
        try {
            setLoading(true);
            const res  = await fetch(`/api/members${q ? `?search=${q}` : ""}`);
            const data = await res.json();
            if (data.success) setMembers(data.members);
            else setError(data.error || "Could not load members");
        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialSearch) {
            setSearch(initialSearch);
            fetchMembers(initialSearch);
            return;
        }
        fetchMembers();
    }, [initialSearch]);
    useEffect(() => {
        const t = setTimeout(() => fetchMembers(search), 300);
        return () => clearTimeout(t);
    }, [search]);
    useEffect(() => { setSelectedIds([]); }, [search]);
    useEffect(() => {
        if (selected) { setEditForm({ ...selected, password: "" }); setEditImage(selected.image); setIsEditing(false); }
    }, [selected]);

    const updateStatus = async (id, status, rejectionReason = "") => {
        const payload = { id, status };
        if (status === "REJECTED") payload.rejectionReason = rejectionReason;
        const res = await fetch("/api/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
            if (selected?.id === id) setSelected(s => ({ ...s, status }));
        }
    };

    const updateStatusBulk = async (status, rejectionReason = "") => {
        if (!selectedIds.length) return;
        const payload = { ids: selectedIds, status };
        if (status === "REJECTED") payload.rejectionReason = rejectionReason;
        const res = await fetch("/api/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setSelectedIds([]);
            fetchMembers(search);
        }
    };

    const openSingleRejectModal = (member) => {
        if (!member) return;
        setRejectReason("");
        setRejectModal({ ids: [member.id], label: member.name || member.email || member.id, isBulk: false });
    };

    const openBulkRejectModal = () => {
        if (!selectedIds.length) return;
        setRejectReason("");
        setRejectModal({ ids: [...selectedIds], label: `${selectedIds.length} member(s)`, isBulk: true });
    };

    const closeRejectModal = () => {
        setRejectModal(null);
        setRejectReason("");
    };

    const confirmReject = async () => {
        if (!rejectModal) return;
        const reason = rejectReason;
        const targetIds = rejectModal.ids;
        const isBulk = rejectModal.isBulk;
        closeRejectModal();
        if (isBulk) {
            setSelectedIds([]);
            await updateStatusBulk("REJECTED", reason);
        } else {
            await updateStatus(targetIds[0], "REJECTED", reason);
        }
    };

    const updateRoleBulk = async (role) => {
        if (!selectedIds.length) return;
        const res = await fetch("/api/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds, role }),
        });
        if (res.ok) {
            setSelectedIds([]);
            fetchMembers(search);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return;
        const res  = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setMembers(prev => prev.filter(m => m.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Delete ${selectedIds.length} member(s)?`)) return;
        const res = await fetch(`/api/members?ids=${selectedIds.join(",")}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setSelectedIds([]);
            fetchMembers(search);
        }
    };

    const allSelected = members.length > 0 && members.every((m) => selectedIds.includes(m.id));
    const toggleSelectAll = () => {
        if (allSelected) return setSelectedIds([]);
        setSelectedIds(members.map((m) => m.id));
    };
    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        const payload = { ...editForm, image: editImage };
        if (!payload.password) delete payload.password;
        const res = await fetch("/api/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            setMembers(prev => prev.map(m => m.id === editForm.id ? { ...m, ...payload } : m));
            setSelected({ ...editForm, image: editImage });
            setIsEditing(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append("file", file);
        setUploadingImage(true);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Could not upload image");
                return;
            }
            setEditImage(data.url);
        } catch {
            setError("Connection error while uploading image");
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError("");
        try {
            const res  = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMember),
            });
            const data = await res.json();
            if (data.success) {
                setShowCreate(false);
                setNewMember({ name: "", email: "", password: "", role: "MEMBER" });
                fetchMembers();
            } else {
                setError(data.error || "Could not create member");
            }
        } catch {
            setError("Connection error");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-5 min-w-0">
            <PageHeader
                title="Member Management"
                subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""}`}
                actions={
                    <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
                        <UserPlus size={15} />
                        New Member
                    </button>
                }
            />

            <div className="card p-3 flex flex-col sm:flex-row gap-3 min-w-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input !pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-brand-primary-light border border-brand-primary/20 text-brand-primary px-3 py-2 rounded-md flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold mr-1">{selectedIds.length} selected</span>
                    <button onClick={() => updateStatusBulk("APPROVED")} className="btn-primary text-xs py-1.5 px-3">Activate</button>
                    <button onClick={openBulkRejectModal} className="btn-danger text-xs py-1.5 px-3">Block</button>
                    <button onClick={() => updateRoleBulk("MEMBER")} className="btn-secondary text-xs py-1.5 px-3">Make Member</button>
                    <button onClick={() => updateRoleBulk("ADMIN")} className="btn-secondary text-xs py-1.5 px-3">Make Admin</button>
                    <button onClick={handleBulkDelete} className="btn-secondary text-xs py-1.5 px-3">Delete</button>
                </div>
            )}

            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton variant="avatar" className="w-9 h-9 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton variant="text" className="w-48 h-3" />
                                    <Skeleton variant="text" className="w-32 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-status-error text-sm">{error}</div>
                ) : members.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={UserCheck}
                            title="No members found"
                            description={search ? "Try another search term." : "Add the first platform member."}
                            action={!search && (
                                <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
                                    <UserPlus size={14} /> New Member
                                </button>
                            )}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-surface-subtle border-b border-border-default">
                                <tr>
                                    {["select", "Member", "Email", "Application", "Role", "Status", "Joined", ""].map((h, i) => (
                                        <th key={i} className="text-left text-[10px] font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                            {h === "select" ? (
                                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                                            ) : h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {members.map((m) => (
                                    <tr key={m.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(m.id)}
                                                onChange={() => toggleSelect(m.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={m.image} name={m.name} size="sm" />
                                                <p className="text-sm font-medium text-text-primary truncate max-w-[180px]">{m.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-secondary">{m.email}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {applicationTypeBadge(m.applicationType)}
                                        </td>
                                        <td className="px-4 py-3">{roleBadge(m.role)}</td>
                                        <td className="px-4 py-3">{statusBadge(m.status)}</td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-xs text-text-muted">{fmtDate(m.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => setSelected(m)}
                                                    className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary-light rounded-md transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(m.id, m.name)}
                                                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <UserX size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-brand-strong/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-xl shadow-modal w-full max-w-lg border border-border-default flex flex-col max-h-[90vh] animate-scale-in">
                        {/* Cabeçalho colorido */}
                        <div className="relative h-24 bg-gradient-to-r from-brand-primary to-accent rounded-t-xl shrink-0">
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-md transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`absolute top-3 right-12 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                    isEditing ? "bg-white text-brand-primary" : "bg-black/20 text-white hover:bg-black/40"
                                }`}
                            >
                                <Edit2 size={12} />
                                {isEditing ? "Editing" : "Edit"}
                            </button>
                            <div className="absolute -bottom-10 left-5">
                                <div className="w-20 h-20 rounded-xl bg-surface-card p-1 shadow-card relative group">
                                    <div className="w-full h-full rounded-lg bg-surface-subtle overflow-hidden flex items-center justify-center">
                                        {uploadingImage
                                            ? <Spinner size="sm" />
                                            : editImage
                                            ? <img src={editImage} alt="foto" className="w-full h-full object-cover" />
                                            : <span className="text-2xl font-bold text-brand-primary">{selected.name?.charAt(0)}</span>
                                        }
                                    </div>
                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center courser-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <Upload className="text-white" size={20} />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="pt-12 px-5 pb-5 overflow-y-auto">
                            {!isEditing ? (
                                <>
                                    <div className="flex items-start justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">{selected.name}</h3>
                                            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                                <Mail size={11} />{selected.email}
                                            </p>
                                        </div>
                                        {statusBadge(selected.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-surface-subtle rounded-md p-3">
                                            <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1 mb-1">
                                                <Briefcase size={11} /> Registration
                                            </p>
                                            <p className="text-sm text-text-primary">{selected.crm || "Not provided"}</p>
                                        </div>
                                        <div className="bg-surface-subtle rounded-md p-3">
                                            <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1 mb-1">
                                                <Stethoscope size={11} /> Specialty
                                            </p>
                                            <p className="text-sm text-text-primary">{selected.specialty || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="bg-surface-subtle rounded-md p-3 mb-4">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                                                <UserPlus size={11} /> Application
                                            </p>
                                            {applicationTypeBadge(selected.applicationType || "MEMBER")}
                                        </div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                                            <FileText size={11} /> Submitted Documents
                                        </p>
                                        <DocumentsList
                                            docs={selected.applicationDocuments}
                                            applicationType={selected.applicationType || "MEMBER"}
                                        />
                                    </div>

                                    <div className="bg-surface-subtle rounded-md p-3 mb-5">
                                        <p className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1 mb-2">
                                            <FileText size={11} /> Biography
                                        </p>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            {selected.bio || "No biography."}
                                        </p>
                                    </div>

                                    <div className="border-t border-border-default pt-4 flex items-center justify-between">
                                        {selected.status === "PENDING" && (
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => openSingleRejectModal(selected)}
                                                    className="btn-danger flex-1 py-2"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selected.id, "APPROVED")}
                                                    className="btn-primary flex-1 py-2"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                            </div>
                                        )}
                                        {selected.status === "APPROVED" && (
                                            <button
                                                onClick={() => openSingleRejectModal(selected)}
                                                className="text-xs text-status-error hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-status-error-bg transition-colors"
                                            >
                                                <UserX size={13} /> Deactivate member
                                            </button>
                                        )}
                                        {selected.status === "REJECTED" && (
                                            <button
                                                onClick={() => updateStatus(selected.id, "APPROVED")}
                                                className="text-xs text-status-success hover:text-green-700 font-medium flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-status-success-bg transition-colors"
                                            >
                                                <Check size={13} /> Reactivate member
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleEditSave} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-1">Full name</label>
                                        <input className="input" value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-1">Email</label>
                                        <input type="email" className="input" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Registration</label>
                                            <input className="input" value={editForm.crm || ""} onChange={e => setEditForm(f => ({ ...f, crm: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Specialty</label>
                                            <input className="input" value={editForm.specialty || ""} onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-1">Biography</label>
                                        <textarea className="input h-20 resize-none" value={editForm.bio || ""} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                                    </div>
                                    <div className="bg-status-warning-bg border border-status-warning/20 rounded-md p-3">
                                        <label className="block text-xs font-semibold text-status-warning flex items-center gap-1 mb-1">
                                            <Lock size={11} /> New password (optional)
                                        </label>
                                        <input type="password" className="input" placeholder="Leave blank to keep current" value={editForm.password || ""} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Status</label>
                                            <select className="input" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Active</option>
                                                <option value="REJECTED">Blocked</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Role</label>
                                            <select className="input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                                                <option value="MEMBER">Member</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary w-full gap-2 mt-2">
                                        <Save size={14} /> Save changes
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 bg-brand-strong/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-xl shadow-modal w-full max-w-sm border border-border-default animate-scale-in">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                            <h3 className="text-sm font-bold text-text-primary">New Member</h3>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-surface-subtle rounded-md transition-colors">
                                <X size={15} className="text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="px-5 py-4 space-y-3">
                            {error && <p className="text-xs text-status-error bg-status-error-bg rounded-md px-3 py-2">{error}</p>}
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Name</label>
                                <input className="input" placeholder="Full name" value={newMember.name} onChange={e => setNewMember(n => ({ ...n, name: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Email</label>
                                <input type="email" className="input" placeholder="email@example.com" value={newMember.email} onChange={e => setNewMember(n => ({ ...n, email: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
                                <input type="password" className="input" placeholder="At least 6 characters" value={newMember.password} onChange={e => setNewMember(n => ({ ...n, password: e.target.value }))} required minLength={6} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Role</label>
                                <select className="input" value={newMember.role} onChange={e => setNewMember(n => ({ ...n, role: e.target.value }))}>
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                            <button type="submit" disabled={creating} className="btn-primary w-full mt-1 gap-2">
                                {creating ? <Spinner size="sm" /> : <UserPlus size={14} />}
                                {creating ? "Creating..." : "Create Member"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {rejectModal && (
                <div className="fixed inset-0 bg-brand-strong/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-xl shadow-modal w-full max-w-md border border-border-default animate-scale-in">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                <UserX size={15} className="text-status-error" />
                                {rejectModal.isBulk ? "Block selected members" : "Reject member"}
                            </h3>
                            <button onClick={closeRejectModal} className="p-1.5 hover:bg-surface-subtle rounded-md transition-colors">
                                <X size={15} className="text-text-muted" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                            <div className="bg-status-error-bg border border-status-error/20 rounded-md px-3 py-2">
                                <p className="text-xs text-status-error">
                                    {rejectModal.isBulk
                                        ? `This will block ${rejectModal.ids.length} selected member(s) and set their status to Blocked.`
                                        : `This will block "${rejectModal.label}" and set their status to Blocked.`}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">
                                    Rejection reason (optional — a standard message will be used if left blank)
                                </label>
                                <textarea
                                    className="input h-24 resize-none"
                                    placeholder="e.g. CV does not meet the publication requirements, or missing proof of professional activity."
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    maxLength={2000}
                                />
                                <p className="text-[10px] text-text-muted mt-1">
                                    {rejectReason.length}/2000 characters
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button onClick={closeRejectModal} className="btn-secondary text-xs py-2 px-4">
                                    Cancel
                                </button>
                                <button onClick={confirmReject} className="btn-danger text-xs py-2 px-4 gap-1.5">
                                    <UserX size={13} />
                                    {rejectModal.isBulk ? `Block ${rejectModal.ids.length}` : "Confirm Rejection"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
