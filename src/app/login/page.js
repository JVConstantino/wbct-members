"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    Loader2,
    User,
    Eye,
    EyeOff,
    Stethoscope,
    FileText,
    ArrowRight,
    ArrowLeft,
    Briefcase,
    CheckCircle,
    Clock,
    Camera,
    Upload,
    Sun,
    Moon
} from "lucide-react";

export default function LoginPage() {
    // Estado principal: false = Login (Overlay na direita), true = Registro (Overlay na esquerda)
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [registerStep, setRegisterStep] = useState(1); // 1 ou 2
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Estados do Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Estados do Registro - Passo 1 (Acesso)
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    // Estados do Registro - Passo 2 (Profissional)
    const [registerCRM, setRegisterCRM] = useState("");
    const [registerSpecialty, setRegisterSpecialty] = useState("");
    const [registerBio, setRegisterBio] = useState("");
    const [registerImage, setRegisterImage] = useState(""); // Base64 image
    const [uploadingImage, setUploadingImage] = useState(false);

    // Estados gerais
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    const router = useRouter();

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
            document.documentElement.setAttribute("data-theme", savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!loginEmail.trim() || !loginPassword.trim()) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: loginEmail,
                password: loginPassword,
            });

            if (result.error) {
                if (result.error.includes("approv")) {
                    setError("Your account awaits approval.");
                } else if (result.error.includes("refused")) {
                    setError("Registration refused. Contact support.");
                } else {
                    setError("Invalid credentials or pending account.");
                }
                setLoading(false);
            } else {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/membro");
                }
            }
        } catch (err) {
            setError("Error connecting.");
            setLoading(false);
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setError("");

        if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            setError("Please fill in all required fields.");
            return;
        }
        setRegisterStep(2);
    };

    const handlePrevStep = () => {
        setError("");
        setRegisterStep(1);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("Image must be max 2MB.");
                return;
            }
            setError("");
            setUploadingImage(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegisterImage(reader.result);
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        }
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
                    name: registerName,
                    email: registerEmail,
                    password: registerPassword,
                    crm: registerCRM,
                    specialty: registerSpecialty,
                    bio: registerBio,
                    image: registerImage
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error creating account.");
                setLoading(false);
            } else {
                setLoading(false);
                setRegistrationSuccess(true);
            }
        } catch (err) {
            setError("Error registering.");
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError("");
        if (!isRegisterMode) {
            setRegisterStep(1);
            setRegistrationSuccess(false);
            setRegisterImage("");
        }
    };

    return (
        <div className="min-h-screen w-full bg-surface-section flex items-center justify-center p-4 relative transition-colors duration-300">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-3 rounded-full bg-surface-card text-text-primary shadow-lg border border-border-default hover:bg-surface-subtle transition-all z-50 focus:ring-2 focus:ring-brand-primary"
                title={theme === "light" ? "Dark Mode" : "Light Mode"}
            >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Container Principal Relativo */}
            <div className={`relative w-full max-w-[900px] bg-surface-card rounded-3xl shadow-2xl overflow-hidden flex flex-col md:block ${registerStep === 2 && isRegisterMode ? 'md:h-[650px] h-[750px] mt-10 md:mt-0' : 'h-[600px]'} transition-all duration-300`}>

                {/* --- FORMULÁRIO DE LOGIN (Fica na Esquerda) --- */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center p-10 transition-all duration-700 ${isRegisterMode ? 'md:opacity-0 md:translate-x-full pointer-events-none' : 'md:opacity-100 md:translate-x-0 z-10'}`}>
                    <form onSubmit={handleLogin} className="flex flex-col h-full justify-center max-w-sm mx-auto w-full">
                        <h2 className="text-3xl font-black text-brand-strong mb-6 text-center">Login</h2>

                        {/* Social Login */}
                        <div className="flex justify-center gap-3 mb-6">
                            {[1].map((i) => (
                                <button key={i} type="button" className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center text-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors">
                                    <User size={18} />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-center text-text-muted mb-6">or use your email account</p>

                        <div className="space-y-4">
                            <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                <Mail className="text-text-muted mr-3" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                <Lock className="text-text-muted mr-3" size={18} />
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="text-text-muted hover:text-text-primary">
                                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="text-right">
                                <a href="#" className="text-xs text-text-muted hover:text-brand-primary font-bold">Forgot password?</a>
                            </div>

                            {error && !isRegisterMode && (
                                <div className="text-red-600 bg-red-50 p-3 rounded-lg text-xs text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                                    {error.includes("pendente") || error.includes("aprovação") ? <Clock size={16} /> : null}
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-primary text-white font-bold py-3 rounded-full uppercase tracking-wider text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Login"}
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <div className="mt-8 text-center md:hidden">
                            <p className="text-text-muted text-xs mb-2">New here?</p>
                            <button type="button" onClick={toggleMode} className="text-brand-primary font-bold text-sm">Create Account</button>
                        </div>
                    </form>
                </div>

                {/* --- FORMULÁRIO DE REGISTRO (Fica na Direita) --- */}
                <div className={`absolute top-0 left-0 md:left-1/2 w-full md:w-1/2 h-full flex flex-col justify-center p-6 md:p-10 transition-all duration-700 ${!isRegisterMode ? 'md:opacity-0 md:-translate-x-full pointer-events-none' : 'md:opacity-100 md:translate-x-0 z-10'} ${!isRegisterMode ? 'hidden md:flex' : 'flex'}`}>

                    {/* TELA DE SUCESSO / APROVAÇÃO PENDENTE */}
                    {registrationSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="text-brand-primary" size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-brand-strong mb-2">Registration Received!</h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-xs">
                                Your data has been sent for analysis. <br />
                                <strong className="text-brand-primary">Wait for team approval</strong>. You can login once your account is approved.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="px-8 py-3 bg-surface-subtle text-text-primary font-bold rounded-full text-sm hover:bg-border-default transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        // FORMULÁRIO DE REGISTRO NORMAL
                        <form onSubmit={handleRegister} className="flex flex-col h-full justify-center max-w-sm mx-auto w-full relative">
                            <h2 className="text-3xl font-black text-brand-strong mb-2 text-center">Create Account</h2>
                            <div className="flex justify-center gap-1 mb-6">
                                <div className={`h-1 rounded-full transition-all duration-300 ${registerStep === 1 ? 'w-8 bg-brand-primary' : 'w-2 bg-border-default'}`}></div>
                                <div className={`h-1 rounded-full transition-all duration-300 ${registerStep === 2 ? 'w-8 bg-brand-primary' : 'w-2 bg-border-default'}`}></div>
                            </div>

                            {registerStep === 1 ? (
                                // PASSO 1: Acesso
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="text-center mb-4">
                                        <p className="text-sm font-bold text-text-primary">Access Credentials</p>
                                        <p className="text-xs text-text-muted">Step 1 of 2</p>
                                    </div>

                                    <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <User className="text-text-muted mr-3" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                            value={registerName}
                                            onChange={(e) => setRegisterName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <Mail className="text-text-muted mr-3" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <Lock className="text-text-muted mr-3" size={18} />
                                        <input
                                            type={showRegisterPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="text-text-muted hover:text-text-primary">
                                            {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {error && isRegisterMode && (
                                        <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded animate-pulse">{error}</p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full bg-brand-primary text-white font-bold py-3 rounded-full uppercase tracking-wider text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Next <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                // PASSO 2: Profissional e Foto
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="text-center mb-2">
                                        <p className="text-sm font-bold text-text-primary">Professional Profile</p>
                                        <p className="text-xs text-text-muted">Step 2 of 2</p>
                                    </div>

                                    {/* Upload de Foto */}
                                    <div className="flex justify-center mb-4">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-20 h-20 rounded-full bg-surface-subtle border-2 border-border-default flex items-center justify-center overflow-hidden transition-all hover:border-brand-primary">
                                                {registerImage ? (
                                                    <img src={registerImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="text-text-muted" size={30} />
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 bg-brand-primary text-white p-1.5 rounded-full shadow-lg">
                                                <Upload size={12} />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <Briefcase className="text-text-muted mr-3" size={18} />
                                        <input
                                            type="text"
                                            placeholder="CRM (Optional)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                            value={registerCRM}
                                            onChange={(e) => setRegisterCRM(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-surface-subtle flex items-center px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <Stethoscope className="text-text-muted mr-3" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Specialty"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70"
                                            value={registerSpecialty}
                                            onChange={(e) => setRegisterSpecialty(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-surface-subtle flex items-start px-4 py-3 rounded-lg border border-transparent focus-within:border-brand-primary transition-colors">
                                        <FileText className="text-text-muted mr-3 mt-1" size={18} />
                                        <textarea
                                            placeholder="Short Bio (Optional)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder-text-muted/70 resize-none h-16"
                                            value={registerBio}
                                            onChange={(e) => setRegisterBio(e.target.value)}
                                        />
                                    </div>

                                    {error && isRegisterMode && (
                                        <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded animate-pulse">{error}</p>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="w-12 h-12 flex items-center justify-center rounded-full border border-border-default text-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors shrink-0"
                                            title="Back"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-full uppercase tracking-wider text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Finish Registration"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Toggle */}
                            <div className="mt-8 text-center md:hidden">
                                <p className="text-text-muted text-xs mb-2">Already have an account?</p>
                                <button type="button" onClick={toggleMode} className="text-brand-primary font-bold text-sm">Login</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* --- OVERLAY PANEL (Deslizante) --- */}
                {/* Só visível em Desktop */}
                <div
                    className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 hidden md:block ${isRegisterMode ? '-translate-x-full rounded-r-[100px] rounded-l-none' : 'translate-x-0 rounded-l-[100px] rounded-r-none'}`}
                    style={{ borderRadius: isRegisterMode ? '0 150px 150px 0' : '150px 0 0 150px' }}
                >
                    <div className={`bg-gradient-to-br from-brand-primary to-emerald-700 w-full h-full text-white relative flex items-center justify-center`}>
                        {/* Overlay Esquerdo (Para quando está em REGISTER mode -> Mostra convite para Login) */}
                        <div className={`absolute w-full h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ${isRegisterMode ? 'translate-x-0' : 'translate-x-[20%] opacity-0'}`}>
                            <h2 className="text-4xl font-black mb-4 !text-white">Welcome!</h2>
                            <p className="mb-8 font-medium !text-white/90 leading-relaxed">
                                To stay connected with us, please login with your personal information.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-10 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-brand-primary transition-colors"
                            >
                                Login
                            </button>
                        </div>

                        {/* Overlay Direito (Para quando está em LOGIN mode -> Mostra convite para Cadastro) */}
                        <div className={`absolute w-full h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ${isRegisterMode ? '-translate-x-[20%] opacity-0' : 'translate-x-0'}`}>
                            <h2 className="text-4xl font-black mb-4 !text-white">Hello, Doctor!</h2>
                            <p className="mb-8 font-medium !text-white/90 leading-relaxed">
                                Enter your professional details and join our exclusive medical community.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-10 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-brand-primary transition-colors"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <div className="fixed bottom-4 text-xs text-text-muted">
                © 2026 WBCT • Medical Platform
            </div>
        </div>
    );
}
