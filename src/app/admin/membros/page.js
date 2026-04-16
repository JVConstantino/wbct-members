"use client";

import { useState, useEffect } from "react";
import { Search, UserCheck, UserX, Eye, UserPlus, Loader2, X, MoreHorizontal, Check, ShieldAlert, FileText, Stethoscope, Briefcase, Mail, Camera, Save, Edit2, Lock, Upload } from "lucide-react";

export default function MembersManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal de detalhes e edição
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editImage, setEditImage] = useState(null);

    // Modal de criação
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        password: "",
        role: "MEMBER"
    });

    // Buscar membros do banco
    const fetchMembers = async (search = "") => {
        try {
            setLoading(true);
            const res = await fetch(`/api/members${search ? `?search=${search}` : ""}`);
            const data = await res.json();

            if (data.success) {
                setMembers(data.members);
            } else {
                setError(data.error || "Error loading members");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Busca com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMembers(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Ao selecionar membro, prepara form de edição
    useEffect(() => {
        if (selectedMember) {
            setEditForm({ ...selectedMember, password: "" }); // Senha vazia por padrão
            setEditImage(selectedMember.image);
            setIsEditing(false);
        }
    }, [selectedMember]);

    const handleDelete = async (id, name) => {
        if (!confirm(`Do you really want to delete "${name}"?`)) return;

        try {
            const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setMembers(members.filter(m => m.id !== id));
                if (selectedMember?.id === id) setSelectedMember(null);
            } else {
                alert("Error deleting: " + data.error);
            }
        } catch (err) {
            alert("Connection error");
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch("/api/members", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (res.ok) {
                // Atualiza localmente
                const updatedMembers = members.map(m => m.id === id ? { ...m, status: newStatus } : m);
                setMembers(updatedMembers);

                // Atualiza modal se aberto
                if (selectedMember && selectedMember.id === id) {
                    setSelectedMember({ ...selectedMember, status: newStatus });
                }
            } else {
                alert("Error updating status");
            }
        } catch (error) {
            alert("Connection error");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editForm, image: editImage };
            if (!payload.password) delete payload.password; // Remove senha se vazia

            const res = await fetch("/api/members", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Atualiza lista principal
                setMembers(members.map(m => m.id === editForm.id ? { ...m, ...payload, image: editImage } : m));
                // Atualiza modal visualizacao
                setSelectedMember({ ...editForm, image: editImage });
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                alert("Error saving changes.");
            }
        } catch (err) {
            alert("Connection error.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        try {
            const res = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMember)
            });

            const data = await res.json();

            if (data.success) {
                setShowCreateModal(false);
                setNewMember({ name: "", email: "", password: "", role: "MEMBER" });
                fetchMembers();
            } else {
                setError(data.error || "Error creating member");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-text-primary">Members</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center gap-2 text-sm"
                >
                    <UserPlus size={16} />
                    New Member
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabela */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-brand-primary" size={32} />
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">No members found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-surface-subtle border-b border-border-subtle">
                                <tr>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-3 w-auto">Member</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-3 hidden md:table-cell w-64">Email</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-3 w-24">Role</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-3 w-28">Status</th>
                                    <th className="text-left text-[10px] font-black text-text-muted uppercase px-4 py-3 hidden sm:table-cell w-32">Joined</th>
                                    <th className="text-right text-[10px] font-black text-text-muted uppercase px-4 py-3 w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-subtle transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase overflow-hidden">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.name?.charAt(0) || "?"
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-text-primary text-sm truncate">{member.name}</p>
                                                    <p className="text-[10px] text-text-muted truncate max-w-[200px] md:hidden">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-text-secondary truncate block">{member.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${member.role === "ADMIN"
                                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                }`}>
                                                {member.role === "ADMIN" ? "Admin" : "Member"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.status === 'PENDING' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 animate-pulse">
                                                    <ShieldAlert size={10} />
                                                    Pending
                                                </span>
                                            ) : member.status === 'APPROVED' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                    <Check size={10} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                                    <UserX size={10} />
                                                    Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-xs text-text-muted">{formatDate(member.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    className="p-1.5 hover:bg-surface-active rounded-lg text-text-muted hover:text-text-primary"
                                                    title="View Details"
                                                    onClick={() => setSelectedMember(member)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 rounded-lg transition-colors"
                                                    title="Delete"
                                                    onClick={() => handleDelete(member.id, member.name)}
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

            {/* MODAL DE DETALHES + EDIÇÃO */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-lg border border-border-default overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="relative h-24 bg-gradient-to-r from-brand-primary to-emerald-600 shrink-0">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors z-10"
                            >
                                <X size={18} />
                            </button>

                            {/* Toggle Edit Mode */}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`absolute top-4 right-14 p-1.5 rounded-full transition-colors z-10 flex items-center gap-1 px-3 ${isEditing ? 'bg-white text-brand-primary font-bold' : 'bg-black/20 text-white hover:bg-black/40'}`}
                            >
                                <Edit2 size={14} />
                                <span className="text-xs">{isEditing ? 'Editing' : 'Edit'}</span>
                            </button>

                            <div className="absolute -bottom-10 left-6">
                                <div className="w-20 h-20 rounded-2xl bg-surface-card p-1 shadow-lg relative group">
                                    <div className="w-full h-full rounded-xl bg-surface-subtle flex items-center justify-center overflow-hidden">
                                        {editImage ? (
                                            <img src={editImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-black text-brand-primary">{selectedMember.name?.charAt(0)}</span>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            <Upload className="text-white" size={24} />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo - Com Scroll se necessário */}
                        <div className="pt-12 px-6 pb-6 overflow-y-auto">
                            {!isEditing ? (
                                // --- MODO VISUALIZAÇÃO ---
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-black text-text-primary">{selectedMember.name}</h3>
                                            <p className="text-sm text-text-muted flex items-center gap-1">
                                                <Mail size={12} /> {selectedMember.email}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedMember.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                                                selectedMember.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {selectedMember.status === 'PENDING' ? 'Pending' :
                                                    selectedMember.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-surface-subtle p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-text-muted mb-1 text-xs uppercase font-bold">
                                                <Briefcase size={14} /> CRM
                                            </div>
                                            <p className="text-text-primary font-medium">{selectedMember.crm || "Not provided"}</p>
                                        </div>
                                        <div className="bg-surface-subtle p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-text-muted mb-1 text-xs uppercase font-bold">
                                                <Stethoscope size={14} /> Specialty
                                            </div>
                                            <p className="text-text-primary font-medium">{selectedMember.specialty || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="bg-surface-subtle p-3 rounded-lg mb-8">
                                        <div className="flex items-center gap-2 text-text-muted mb-2 text-xs uppercase font-bold">
                                            <FileText size={14} /> Bio
                                        </div>
                                        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedMember.bio || "No biography available."}
                                        </p>
                                    </div>

                                    {/* Ações de Aprovação */}
                                    {selectedMember.status === 'PENDING' && (
                                        <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-6">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedMember.id, 'REJECTED')}
                                                className="py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XOctagonIcon size={18} />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedMember.id, 'APPROVED')}
                                                className="py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} />
                                                Approve
                                            </button>
                                        </div>
                                    )}
                                    {/* Ações de Bloqueio para Aprovados */}
                                    {selectedMember.status === 'APPROVED' && (
                                        <div className="border-t border-border-subtle pt-6 flex justify-end">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedMember.id, 'REJECTED')}
                                                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 border border-transparent hover:border-red-200 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <UserX size={14} /> Deactivate/Block Member
                                            </button>
                                        </div>
                                    )}
                                    {/* Reativação */}
                                    {selectedMember.status === 'REJECTED' && (
                                        <div className="border-t border-border-subtle pt-6 flex justify-end">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedMember.id, 'APPROVED')}
                                                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 border border-transparent hover:border-emerald-200 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Check size={14} /> Reactivate Member
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // --- MODO EDIÇÃO ---
                                <form onSubmit={handleEditSave} className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full input-field p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary">Email</label>
                                            <input
                                                type="email"
                                                className="w-full input-field p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-text-secondary">CRM</label>
                                                <input
                                                    type="text"
                                                    className="w-full input-field p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                    value={editForm.crm || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, crm: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-text-secondary">Specialty</label>
                                                <input
                                                    type="text"
                                                    className="w-full input-field p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                    value={editForm.specialty || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary">Bio</label>
                                            <textarea
                                                className="w-full input-field p-2 rounded-lg bg-surface-subtle border border-border-subtle h-24 resize-none"
                                                value={editForm.bio || ''}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            />
                                        </div>

                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                            <label className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1 mb-1">
                                                <Lock size={12} /> Reset Password (Optional)
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Leave blank to keep current"
                                                className="w-full input-field p-2 rounded-lg bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-900/30"
                                                value={editForm.password || ''}
                                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-text-secondary">Status</label>
                                            <select
                                                className="w-full p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved (Active)</option>
                                                <option value="REJECTED">Rejected (Blocked)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary">Role</label>
                                            <select
                                                className="w-full p-2 rounded-lg bg-surface-subtle border border-border-subtle"
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            >
                                                <option value="MEMBER">Member</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all mt-4"
                                        >
                                            <Save size={18} /> Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação (Mantido igual) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-xl shadow-2xl w-full max-w-sm border border-border-subtle">
                        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                            <h3 className="text-base font-black text-text-primary">New Member</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 hover:bg-surface-subtle rounded-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    placeholder="Full name"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">E-mail</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    placeholder="email@exemplo.com"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    placeholder="******"
                                    value={newMember.password}
                                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full btn btn-primary py-2 text-sm"
                                >
                                    {creating ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Create Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function XOctagonIcon({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    )
}
