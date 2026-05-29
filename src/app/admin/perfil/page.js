"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Save, Camera, Briefcase, Stethoscope, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

export default function AdminProfile() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState({ name: "", email: "", crm: "", specialty: "", bio: "", image: "", password: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (session?.user?.email) fetchProfile(session.user.email);
    }, [session]);

    const fetchProfile = async (email) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/members?search=${email}`);
            const data = await res.json();
            if (data.success && data.members.length > 0) {
                const user = data.members.find(m => m.email === email);
                if (user) {
                    setProfile({ ...user, password: "" });
                    setImagePreview(user.image);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setProfile(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...profile };
            if (!payload.password) delete payload.password;
            const res = await fetch("/api/members", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Perfil atualizado com sucesso!");
                if (profile.name !== session.user.name) window.location.reload();
            } else {
                alert("Erro ao atualizar perfil.");
            }
        } catch {
            alert("Erro de conexão.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <PageHeader title="Meu Perfil" subtitle="Gerencie seus dados e configurações" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Cartão de Identidade */}
                <div className="col-span-1">
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card overflow-hidden">
                        <div className="h-28 bg-gradient-to-br from-brand-primary to-accent" />
                        <div className="px-5 pb-5 text-center relative">
                            <div className="w-20 h-20 mx-auto bg-surface-card rounded-lg p-1 shadow-modal -mt-10 relative group cursor-pointer" title="Alterar Foto">
                                <div className="w-full h-full rounded-md bg-surface-subtle flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-brand-primary">{profile.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                    <Camera className="text-white" size={18} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <h2 className="text-base font-bold text-text-primary mt-3">{profile.name}</h2>
                            <div className="mt-1">
                                <Badge variant={profile.role === "ADMIN" ? "brand" : "info"}>
                                    {profile.role === "ADMIN" ? "Administrador" : "Médico"}
                                </Badge>
                            </div>

                            <div className="mt-4 text-left space-y-2">
                                <div className="flex items-center gap-2 text-xs text-text-secondary p-2.5 bg-surface-subtle rounded-md">
                                    <Mail size={13} />
                                    <span className="truncate">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary p-2.5 bg-surface-subtle rounded-md">
                                    <Briefcase size={13} />
                                    <span className="truncate">{profile.crm || "CRM não informado"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulário */}
                <div className="col-span-1 lg:col-span-3">
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-5">
                        <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
                            <User size={16} className="text-brand-primary" />
                            Dados Profissionais
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Nome Completo</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block">E-mail (Login)</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block flex items-center gap-1">
                                        <Briefcase size={11} /> CRM
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={profile.crm || ""}
                                        onChange={e => setProfile({ ...profile, crm: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block flex items-center gap-1">
                                        <Stethoscope size={11} /> Especialidade
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={profile.specialty || ""}
                                        onChange={e => setProfile({ ...profile, specialty: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-1.5 block flex items-center gap-1">
                                    <FileText size={11} /> Biografia
                                </label>
                                <textarea
                                    className="input min-h-[100px] resize-none"
                                    value={profile.bio || ""}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Conte um pouco sobre você..."
                                />
                            </div>

                            <div className="pt-4 border-t border-border-subtle">
                                <h4 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                                    <Lock size={13} className="text-status-warning" /> Segurança
                                </h4>
                                <div className="bg-status-warning-bg border border-status-warning/20 p-4 rounded-md">
                                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Nova Senha</label>
                                    <input
                                        type="password"
                                        placeholder="Deixe em branco para manter a senha atual"
                                        className="input"
                                        value={profile.password || ""}
                                        onChange={e => setProfile({ ...profile, password: e.target.value })}
                                    />
                                    <p className="text-[10px] text-text-muted mt-2">
                                        Para alterar a senha, digite uma nova acima. Caso contrário, a senha atual será mantida.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Spinner size="sm" /> : <><Save size={15} /> Salvar Alterações</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
