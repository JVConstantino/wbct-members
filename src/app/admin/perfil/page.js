"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Save, Camera, Upload, Briefcase, Stethoscope, FileText, Loader2 } from "lucide-react";

export default function AdminProfile() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        crm: "",
        specialty: "",
        bio: "",
        image: "",
        password: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (session?.user?.email) {
            fetchProfile(session.user.email);
        }
    }, [session]);

    const fetchProfile = async (email) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/members?search=${email}`);
            const data = await res.json();

            if (data.success && data.members.length > 0) {
                // Filtra pelo email exato, pois search pode trazer parciais
                const user = data.members.find(m => m.email === email);
                if (user) {
                    setProfile({ ...user, password: "" });
                    setImagePreview(user.image);
                }
            }
        } catch (error) {
            console.error("Error loading profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Image must be max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setProfile(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
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
                alert("Profile updated successfully!");
                if (profile.name !== session.user.name) {
                    window.location.reload();
                }
            } else {
                alert("Error updating profile.");
            }
        } catch (error) {
            alert("Connection error.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-black text-text-primary">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Cartão de Identidade / Foto */}
                <div className="col-span-1">
                    <div className="bg-surface-card rounded-2xl shadow-lg border border-border-default overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-brand-primary to-emerald-700"></div>
                        <div className="px-6 pb-6 text-center relative">
                            <div className="w-24 h-24 mx-auto bg-surface-card rounded-2xl p-1.5 shadow-lg -mt-12 relative group cursor-pointer" title="Change Photo">
                                <div className="w-full h-full rounded-xl bg-surface-subtle flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-brand-primary">{profile.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                    <Camera className="text-white" size={24} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-text-primary mt-3">{profile.name}</h2>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-primary/10 text-brand-primary mt-1">
                                {profile.role === 'ADMIN' ? 'Administrator' : 'Member'}
                            </span>

                            <div className="mt-6 text-left space-y-3">
                                <div className="flex items-center gap-3 text-sm text-text-secondary p-3 bg-surface-subtle rounded-lg">
                                    <Mail size={16} />
                                    <span className="truncate">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-secondary p-3 bg-surface-subtle rounded-lg">
                                    <Briefcase size={16} />
                                    <span className="truncate">{profile.crm || 'CRM not provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulário de Edição */}
                <div className="col-span-1 lg:col-span-3">
                    <div className="bg-surface-card rounded-2xl shadow-lg border border-border-default p-6">
                        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <User size={20} className="text-brand-primary" /> Profile Data
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full input-field p-2.5 rounded-lg bg-surface-subtle border border-border-subtle"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-1 block">Email (Login)</label>
                                    <input
                                        type="email"
                                        className="w-full input-field p-2.5 rounded-lg bg-surface-subtle border border-border-subtle"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-1 block flex items-center gap-1"><Briefcase size={12} /> CRM</label>
                                    <input
                                        type="text"
                                        className="w-full input-field p-2.5 rounded-lg bg-surface-subtle border border-border-subtle"
                                        value={profile.crm || ''}
                                        onChange={(e) => setProfile({ ...profile, crm: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-1 block flex items-center gap-1"><Stethoscope size={12} /> Specialty</label>
                                    <input
                                        type="text"
                                        className="w-full input-field p-2.5 rounded-lg bg-surface-subtle border border-border-subtle"
                                        value={profile.specialty || ''}
                                        onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary mb-1 block flex items-center gap-1"><FileText size={12} /> Biography</label>
                                <textarea
                                    className="w-full input-field p-3 rounded-lg bg-surface-subtle border border-border-subtle h-32 resize-none"
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell a bit about yourself..."
                                />
                            </div>

                            <div className="pt-4 border-t border-border-subtle mt-4">
                                <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Lock size={16} className="text-orange-500" /> Security
                                </h4>
                                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <label className="text-xs font-bold text-text-secondary mb-1 block">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep current"
                                        className="w-full input-field p-2.5 rounded-lg bg-white dark:bg-black/20 border border-orange-200 dark:border-orange-900/30"
                                        value={profile.password || ''}
                                        onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                    />
                                    <p className="text-[10px] text-text-muted mt-2">
                                        To change password, type a new one above. Otherwise, current password will be kept.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
