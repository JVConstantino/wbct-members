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
    Loader2,
    Camera,
    Settings,
    Bell,
    FileText
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function MemberProfile() {
    const { updateUser } = useUser();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("dados");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        stack: "",
        specialty: "",
        bio: "",
        image: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [notifications, setNotifications] = useState({
        emailPosts: true,
        emailEvents: true,
        emailNewsletter: false,
        pushMessages: true
    });

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
                        setFormData({
                            name: userData.user.name || "",
                            email: userData.user.email || "",
                            stack: userData.user.stack || "",
                            specialty: userData.user.specialty || "",
                            bio: userData.user.bio || "",
                            image: userData.user.image || ""
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading profile:", err);
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
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                // Atualiza imediatamente a sidebar
                updateUser(formData);
                alert("Perfil atualizado com sucesso!");
            }
        } catch (err) {
            console.error("Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Sincronizando seus dados...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Header / Cover Area */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-primary-900 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                {/* Settings Button */}
                <div className="absolute top-6 right-6">
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/10">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="relative pt-16 pb-8 px-8 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group flex-shrink-0">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white p-1.5 shadow-2xl overflow-hidden">
                            {formData.image ? (
                                <img src={formData.image} alt={formData.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-black">
                                    {formData.name.charAt(0)}
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl transition-opacity">
                                    <Loader2 className="animate-spin text-white" size={32} />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-1 right-1 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer">
                            <Camera size={18} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    {/* Name and Info */}
                    <div className="flex-1 text-center md:text-left pb-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2" style={{ color: '#ffffff' }}>{formData.name || "Seu Nome"}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="flex items-center gap-1.5 bg-primary-500/20 text-primary-300 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                <Stethoscope size={14} /> Médico
                            </span>
                            {formData.specialty && (
                                <span className="text-white/60 text-sm font-medium">{formData.specialty}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Navigation Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-2">
                        {[
                            { id: "dados", icon: User, label: "Dados Pessoais" },
                            { id: "seguranca", icon: Lock, label: "Segurança & Senha" },
                            { id: "notificacoes", icon: Bell, label: "Notificações" },
                            { id: "especialidades", icon: Stethoscope, label: "Especialidades" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-sm transition-all ${activeTab === item.id
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-8 bg-slate-900 rounded-xl text-white">
                        <p className="text-xs font-black uppercase tracking-widest text-primary-400 mb-2">Sua Contribuição</p>
                        <h4 className="text-2xl font-black leading-tight mb-4">Mantenha seu perfil completo.</h4>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                            Um perfil detalhado aumenta sua visibilidade dentro da comunidade médica e facilita o networking.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2">
                    {/* Tab: Dados Pessoais */}
                    {activeTab === "dados" && (
                        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
                                Informações Profissionais
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome de Exibição</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            name="name"
                                            className="input pl-14"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail de Contato</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                        <input
                                            name="email"
                                            className="input pl-14 opacity-60 cursor-not-allowed"
                                            value={formData.email}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Especialidade Médica</label>
                                    <div className="relative group">
                                        <Heart className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            name="stack"
                                            className="input pl-14"
                                            placeholder="Ex: Cardiologia, Pediatria..."
                                            value={formData.stack}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CRM / Registro</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            name="specialty"
                                            className="input pl-14"
                                            placeholder="Ex: CRM/SP 123456"
                                            value={formData.specialty}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Minha Biografia</label>
                                <div className="relative group">
                                    <FileText className="absolute left-5 top-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <textarea
                                        name="bio"
                                        className="input pl-14 min-h-[140px] py-4 leading-relaxed"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Conte sobre sua formação e experiência..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 font-bold disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Alterações</>}
                            </button>
                        </form>
                    )}

                    {/* Tab: Segurança */}
                    {activeTab === "seguranca" && (
                        <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
                                Segurança & Senha
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha Atual</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            className="input pl-14"
                                            placeholder="Digite sua senha atual"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            className="input pl-14"
                                            placeholder="Digite uma nova senha"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            className="input pl-14"
                                            placeholder="Confirme a nova senha"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 font-bold">
                                <Save size={20} /> Alterar Senha
                            </button>
                        </div>
                    )}

                    {/* Tab: Notificações */}
                    {activeTab === "notificacoes" && (
                        <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
                                Preferências de Notificação
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: "emailPosts", label: "Novas Postagens", desc: "Receba e-mail quando houver novas publicações" },
                                    { key: "emailEvents", label: "Eventos & Webinars", desc: "Notificações sobre eventos e aulas ao vivo" },
                                    { key: "emailNewsletter", label: "Newsletter Semanal", desc: "Resumo semanal das melhores publicações" },
                                    { key: "pushMessages", label: "Mensagens Diretas", desc: "Alertas quando alguém enviar uma mensagem" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                            className={`relative w-14 h-8 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${notifications[item.key] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 font-bold">
                                <Save size={20} /> Salvar Preferências
                            </button>
                        </div>
                    )}

                    {/* Tab: Especialidades */}
                    {activeTab === "especialidades" && (
                        <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-1 h-8 bg-primary-600 rounded-full"></div>
                                Minhas Especialidades
                            </h3>

                            <p className="text-slate-500">Selecione as áreas de especialização que você atua ou tem interesse:</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    "Cardiologia", "Pediatria", "Dermatologia", "Ortopedia",
                                    "Ginecologia", "Neurologia", "Oftalmologia", "Psiquiatria",
                                    "Oncologia", "Endocrinologia", "Geriatria", "Urologia"
                                ].map((spec) => (
                                    <button
                                        key={spec}
                                        type="button"
                                        className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>

                            <button className="btn-primary px-10 py-4 rounded-xl flex items-center gap-3 font-bold">
                                <Save size={20} /> Salvar Especialidades
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
