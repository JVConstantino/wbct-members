"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Stethoscope,
    FileText,
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Briefcase,
    AlertCircle
} from "lucide-react";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        crm: "",
        specialty: "",
        bio: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.error || "An error occurred during registration.");
            }
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-surface-section flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-surface-card p-10 rounded-2xl shadow-2xl text-center">
                    <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-text-primary mb-3">Registration Completed!</h2>
                    <p className="text-text-secondary text-sm mb-6">
                        Your information has been registered. You will be redirected to login.
                    </p>
                    <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-primary h-full animate-progress"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-surface-section flex items-center justify-center p-4 md:p-8">
            {/* Container Principal */}
            <div className="w-full max-w-4xl bg-surface-card rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">

                {/* Painel Esquerdo - Verde (Brand) */}
                <div className="md:w-[40%] bg-gradient-to-br from-brand-primary to-emerald-600 p-8 md:p-10 flex flex-col items-center justify-center text-center">
                    <div className="max-w-xs">
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                            Already have an account?
                        </h2>
                        <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">
                            Login to access exclusive content and connect with the community.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block px-8 py-3 border-2 border-white text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-brand-primary transition-all duration-300"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                {/* Painel Direito - Formulário */}
                <div className="md:w-[60%] p-6 md:p-8 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-2xl font-black text-text-primary text-center mb-2">
                            Create Account
                        </h2>

                        {/* Progress Bar */}
                        <div className="flex items-center justify-center gap-3 my-6">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-surface-subtle text-text-muted'}`}>1</div>
                            <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-surface-subtle'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-surface-subtle text-text-muted'}`}>2</div>
                        </div>

                        <p className="text-text-muted text-xs text-center mb-6">
                            {step === 1 ? 'Access Credentials' : 'Professional Information'}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-4">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    {/* Nome */}
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            name="name"
                                            type="text"
                                            className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                                            placeholder="Full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            name="email"
                                            type="email"
                                            className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                                            placeholder="Professional Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Senha */}
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            name="password"
                                            type="password"
                                            className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-brand-primary hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all shadow-lg shadow-brand-primary/30"
                                    >
                                        Next Step
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* CRM e Especialidade */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                name="crm"
                                                type="text"
                                                className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                                                placeholder="Medical License/State"
                                                value={formData.crm}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                            <input
                                                name="specialty"
                                                type="text"
                                                className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                                                placeholder="Specialty"
                                                value={formData.specialty}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3 text-text-muted" size={18} />
                                        <textarea
                                            name="bio"
                                            className="w-full pl-11 pr-4 py-3 bg-surface-subtle border border-border-default rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm min-h-[80px] resize-none"
                                            placeholder="Short Bio (optional)"
                                            value={formData.bio}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="px-6 py-3 rounded-full border border-border-default font-bold text-text-secondary hover:bg-surface-subtle transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ChevronLeft size={18} />
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 bg-brand-primary hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/30"
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Finish
                                                    <CheckCircle2 size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Toggle mobile */}
                        <div className="mt-6 text-center md:hidden">
                            <p className="text-text-muted text-sm">Already have an account?</p>
                            <Link href="/login" className="text-brand-primary font-bold text-sm mt-1 hover:underline">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-progress {
                    animation: progress 3s linear forwards;
                }
            `}</style>
        </div>
    );
}
