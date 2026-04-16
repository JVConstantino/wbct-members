"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Mail, Lock, User, Eye, EyeOff,
    Stethoscope, FileText, ArrowRight, ArrowLeft,
    Briefcase, CheckCircle, Clock, Camera, Upload,
    Sun, Moon, AlertCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui/Skeleton";

/* ── Decoração SVG do painel de marca ── */
function BrandDecoration() {
    return (
        <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
            aria-hidden="true"
        >
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="200" cy="200" r="130" stroke="white" strokeWidth="0.5" fill="none" />
            <circle cx="200" cy="200" r="80" stroke="white" strokeWidth="0.5" fill="none" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="0.5" />
            <line x1="74" y1="74" x2="326" y2="326" stroke="white" strokeWidth="0.3" />
            <line x1="326" y1="74" x2="74" y2="326" stroke="white" strokeWidth="0.3" />
            {/* Cruz médica */}
            <rect x="175" y="130" width="50" height="140" rx="8" fill="white" fillOpacity="0.15" />
            <rect x="130" y="175" width="140" height="50" rx="8" fill="white" fillOpacity="0.15" />
        </svg>
    );
}

/* ── Campo de input do formulário ── */
function FormField({ icon: Icon, children, focusColor = true }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-subtle border border-border-default transition-colors duration-150 focus-within:border-brand-primary focus-within:bg-surface-card`}>
            <Icon size={17} className="text-text-muted shrink-0" />
            {children}
        </div>
    );
}

/* ── Mensagem de erro ── */
function ErrorMessage({ message, type = "error" }) {
    if (!message) return null;
    const isWarning = type === "warning" || message.toLowerCase().includes("aprovação") || message.toLowerCase().includes("aguarda");
    return (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-xs font-medium border ${
            isWarning
                ? "bg-status-warning-bg text-status-warning border-status-warning/20"
                : "bg-status-error-bg text-status-error border-status-error/20"
        }`}>
            {isWarning ? <Clock size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
            {message}
        </div>
    );
}

export default function LoginPage() {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [registerStep, setRegisterStep] = useState(1);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [registerCRM, setRegisterCRM] = useState("");
    const [registerSpecialty, setRegisterSpecialty] = useState("");
    const [registerBio, setRegisterBio] = useState("");
    const [registerImage, setRegisterImage] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const active = saved || (prefersDark ? "dark" : "light");
        setTheme(active);
        document.documentElement.classList.toggle("dark", active === "dark");
        document.documentElement.setAttribute("data-theme", active);
    }, []);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark");
        document.documentElement.setAttribute("data-theme", next);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (!loginEmail.trim() || !loginPassword.trim()) {
            setError("Preencha todos os campos.");
            return;
        }
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: loginEmail,
                password: loginPassword,
            });
            if (result.error) {
                if (result.error.includes("approv") || result.error.includes("aprovação")) {
                    setError("Conta aguardando aprovação da equipe WBCT.");
                } else if (result.error.includes("refused") || result.error.includes("recusad")) {
                    setError("Cadastro recusado. Entre em contato com o suporte.");
                } else {
                    setError("E-mail ou senha incorretos.");
                }
            } else {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                router.push(session?.user?.role === "ADMIN" ? "/admin" : "/membro");
            }
        } catch {
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setError("");
        if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            setError("Preencha todos os campos obrigatórios.");
            return;
        }
        if (registerPassword.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        setRegisterStep(2);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError("A imagem deve ter no máximo 2 MB.");
            return;
        }
        setError("");
        const reader = new FileReader();
        reader.onloadend = () => setRegisterImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: registerName, email: registerEmail,
                    password: registerPassword, crm: registerCRM,
                    specialty: registerSpecialty, bio: registerBio,
                    image: registerImage,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Erro ao criar conta.");
            } else {
                setRegistrationSuccess(true);
            }
        } catch {
            setError("Erro ao registrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(prev => !prev);
        setError("");
        setRegisterStep(1);
        setRegistrationSuccess(false);
        setRegisterImage("");
    };

    return (
        <div className="min-h-screen w-full bg-surface-section flex items-center justify-center p-4 relative transition-colors duration-300">

            {/* Botão de tema */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2.5 rounded-lg bg-surface-card text-text-secondary shadow-sm border border-border-default hover:bg-surface-subtle hover:text-text-primary transition-all z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
            >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Card principal */}
            <div className={`relative w-full max-w-[900px] bg-surface-card rounded-2xl shadow-modal overflow-hidden border border-border-default flex flex-col md:block transition-all duration-300 ${registerStep === 2 && isRegisterMode ? 'md:h-[680px]' : 'md:h-[600px]'}`}>

                {/* ── Formulário de Login ── */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 py-10 transition-all duration-700 ${isRegisterMode ? 'md:opacity-0 md:translate-x-full pointer-events-none' : 'md:opacity-100 md:translate-x-0 z-10'}`}>
                    <form onSubmit={handleLogin} className="flex flex-col justify-center max-w-sm mx-auto w-full gap-5">

                        <div className="text-center">
                            <h2 className="font-display text-2xl font-bold text-text-primary">Acessar plataforma</h2>
                            <p className="text-xs text-text-muted mt-1">Bem-vindo de volta à comunidade WBCT</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <FormField icon={Mail}>
                                <input
                                    type="email"
                                    placeholder="Seu e-mail"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </FormField>

                            <FormField icon={Lock}>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(v => !v)}
                                    className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                                    aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </FormField>
                        </div>

                        <ErrorMessage message={!isRegisterMode ? error : ""} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-2.5 rounded-lg text-sm font-bold tracking-wide"
                        >
                            {loading ? <Spinner size="sm" /> : "Entrar"}
                        </button>

                        <div className="text-center md:hidden pt-2">
                            <p className="text-text-muted text-xs mb-1.5">Ainda não tem conta?</p>
                            <button type="button" onClick={toggleMode} className="text-brand-primary font-semibold text-sm hover:text-brand-primary-hover">
                                Criar conta
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Formulário de Registro ── */}
                <div className={`absolute top-0 left-0 md:left-1/2 w-full md:w-1/2 h-full flex flex-col justify-center px-8 py-10 transition-all duration-700 ${!isRegisterMode ? 'md:opacity-0 md:-translate-x-full pointer-events-none hidden md:flex' : 'flex md:opacity-100 md:translate-x-0 z-10'}`}>

                    {/* Tela de sucesso */}
                    {registrationSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-scale-in max-w-sm mx-auto w-full">
                            <div className="w-16 h-16 rounded-2xl bg-status-success-bg flex items-center justify-center mb-5">
                                <CheckCircle size={32} className="text-status-success" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-text-primary mb-2">Cadastro recebido!</h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-xs">
                                Seus dados foram enviados para análise.<br />
                                <strong className="text-brand-primary">Aguarde a aprovação da equipe WBCT.</strong>{" "}
                                Você receberá acesso assim que seu perfil for validado.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="btn-secondary px-6 py-2 rounded-lg text-sm font-semibold"
                            >
                                Voltar ao login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="flex flex-col justify-center max-w-sm mx-auto w-full gap-4">

                            {/* Header com steps */}
                            <div className="text-center">
                                <h2 className="font-display text-2xl font-bold text-text-primary">Criar conta</h2>
                                <div className="flex items-center justify-center gap-1.5 mt-3">
                                    <div className={`h-1 rounded-full transition-all duration-300 ${registerStep === 1 ? 'w-8 bg-brand-primary' : 'w-3 bg-brand-primary-light'}`} />
                                    <div className={`h-1 rounded-full transition-all duration-300 ${registerStep === 2 ? 'w-8 bg-brand-primary' : 'w-3 bg-surface-subtle'}`} />
                                </div>
                                <p className="text-xs text-text-muted mt-1.5">
                                    {registerStep === 1 ? "Passo 1 de 2 — Credenciais de acesso" : "Passo 2 de 2 — Perfil profissional"}
                                </p>
                            </div>

                            {/* Passo 1 */}
                            {registerStep === 1 && (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    <FormField icon={User}>
                                        <input
                                            type="text"
                                            placeholder="Nome completo"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerName}
                                            onChange={(e) => setRegisterName(e.target.value)}
                                            autoFocus
                                        />
                                    </FormField>
                                    <FormField icon={Mail}>
                                        <input
                                            type="email"
                                            placeholder="E-mail"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                        />
                                    </FormField>
                                    <FormField icon={Lock}>
                                        <input
                                            type={showRegisterPassword ? "text" : "password"}
                                            placeholder="Senha (mín. 6 caracteres)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegisterPassword(v => !v)}
                                            className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                                            aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </FormField>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="btn-primary w-full justify-center py-2.5 rounded-lg text-sm font-bold gap-2"
                                    >
                                        Próximo <ArrowRight size={15} />
                                    </button>
                                </div>
                            )}

                            {/* Passo 2 */}
                            {registerStep === 2 && (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    {/* Avatar upload */}
                                    <div className="flex justify-center">
                                        <label className="relative cursor-pointer group">
                                            <div className="w-18 h-18 w-[72px] h-[72px] rounded-xl bg-surface-subtle border-2 border-border-default group-hover:border-brand-primary flex items-center justify-center overflow-hidden transition-colors duration-150">
                                                {registerImage
                                                    ? <img src={registerImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                                                    : <Camera size={24} className="text-text-muted" />
                                                }
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-md flex items-center justify-center shadow-sm">
                                                <Upload size={11} className="text-white" />
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                                aria-label="Foto de perfil (opcional)"
                                            />
                                        </label>
                                    </div>

                                    <FormField icon={Briefcase}>
                                        <input
                                            type="text"
                                            placeholder="CRM (opcional)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerCRM}
                                            onChange={(e) => setRegisterCRM(e.target.value)}
                                        />
                                    </FormField>
                                    <FormField icon={Stethoscope}>
                                        <input
                                            type="text"
                                            placeholder="Especialidade"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerSpecialty}
                                            onChange={(e) => setRegisterSpecialty(e.target.value)}
                                        />
                                    </FormField>
                                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-surface-subtle border border-border-default focus-within:border-brand-primary transition-colors">
                                        <FileText size={17} className="text-text-muted shrink-0 mt-0.5" />
                                        <textarea
                                            placeholder="Breve bio (opcional)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted resize-none h-14"
                                            value={registerBio}
                                            onChange={(e) => setRegisterBio(e.target.value)}
                                        />
                                    </div>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setRegisterStep(1); setError(""); }}
                                            className="btn-secondary w-11 h-11 p-0 justify-center rounded-lg shrink-0"
                                            aria-label="Voltar"
                                        >
                                            <ArrowLeft size={17} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary flex-1 justify-center py-2.5 rounded-lg text-sm font-bold gap-2"
                                        >
                                            {loading ? <Spinner size="sm" /> : "Concluir cadastro"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center md:hidden">
                                <p className="text-text-muted text-xs mb-1.5">Já possui conta?</p>
                                <button type="button" onClick={toggleMode} className="text-brand-primary font-semibold text-sm hover:text-brand-primary-hover">
                                    Fazer login
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Painel de marca deslizante (somente desktop) ── */}
                <div
                    className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 hidden md:block ${isRegisterMode ? '-translate-x-full' : 'translate-x-0'}`}
                    style={{
                        borderRadius: isRegisterMode
                            ? '0 16px 16px 0'
                            : '16px 0 0 16px',
                    }}
                >
                    <div className="relative w-full h-full bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center text-white overflow-hidden">
                        <BrandDecoration />

                        {/* Conteúdo — modo LOGIN (mostra convite p/ registro) */}
                        <div className={`absolute w-full h-full flex flex-col items-center justify-center px-10 text-center transition-all duration-500 ${isRegisterMode ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                            <div className="mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope size={28} className="text-white" />
                                </div>
                                <h2 className="font-display text-3xl font-bold text-white leading-tight">
                                    Olá, Doutor!
                                </h2>
                                <p className="text-white/80 text-sm mt-3 leading-relaxed max-w-[220px]">
                                    Entre com seus dados profissionais e acesse a comunidade médica exclusiva WBCT.
                                </p>
                            </div>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-brand-primary-active transition-all duration-150"
                            >
                                Criar conta
                            </button>
                        </div>

                        {/* Conteúdo — modo REGISTRO (mostra convite p/ login) */}
                        <div className={`absolute w-full h-full flex flex-col items-center justify-center px-10 text-center transition-all duration-500 ${isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                            <div className="mb-6">
                                <div className="text-3xl font-display font-black text-white tracking-tight mb-1">
                                    WBCT
                                </div>
                                <div className="text-xs text-white/60 uppercase tracking-widest mb-5">
                                    Plataforma Médica
                                </div>
                                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                                    Bem-vindo de volta!
                                </h2>
                                <p className="text-white/80 text-sm mt-3 leading-relaxed max-w-[220px]">
                                    Já faz parte da comunidade? Acesse sua conta e continue conectado.
                                </p>
                            </div>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-brand-primary-active transition-all duration-150"
                            >
                                Fazer login
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p className="fixed bottom-4 text-xs text-text-muted select-none">
                © {new Date().getFullYear()} WBCT · Plataforma Médica
            </p>
        </div>
    );
}
