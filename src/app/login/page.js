"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Mail, Lock, User, Eye, EyeOff,
    Stethoscope, FileText, ArrowRight, ArrowLeft,
    Briefcase, CheckCircle, Clock, Upload,
    AlertCircle, GraduationCap, UserPlus, Loader2, X as XIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/Skeleton";

const TOTAL_REGISTER_STEPS = 4;
const STEP_LABELS = {
    1: "Access credentials",
    2: "Professional profile",
    3: "Documents",
    4: "Review & consent",
};

const DOC_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PICTURE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp";
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const MAX_PICTURE_BYTES = 10 * 1024 * 1024;
const DOC_EXTENSIONS = ["pdf", "doc", "docx"];
const PICTURE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function generateApplicationId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "app-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getExt(name) {
    return (name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isAllowedDoc(file) {
    const ext = getExt(file.name);
    const allowedMime = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return allowedMime.includes(file.type) || DOC_EXTENSIONS.includes(ext);
}

function isAllowedPicture(file) {
    const ext = getExt(file.name);
    const allowedMime = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    return allowedMime.includes(file.type) || PICTURE_EXTENSIONS.includes(ext);
}

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

/* ── Message de erro ── */
function ErrorMessage({ message, type = "error" }) {
    if (!message) return null;
    const isWarning = type === "warning" || message.toLowerCase().includes("approval") || message.toLowerCase().includes("pending");
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

function LoginForm() {
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
    const [pendingApprovalView, setPendingApprovalView] = useState(false);

    const [applicationType, setApplicationType] = useState("MEMBER");
    const [applicationId] = useState(() => generateApplicationId());
    const [documents, setDocuments] = useState({
        cv: { file: null, url: "", uploading: false, error: "" },
        proofOfActivity: { file: null, url: "", uploading: false, error: "" },
        motivationLetter: { file: null, url: "", uploading: false, error: "" },
        picture: { file: null, url: "", uploading: false, error: "" },
        additionalFiles: [],
    });
    const additionalInputRef = useRef(null);

    const [registerTermsAccepted, setRegisterTermsAccepted] = useState(false);
    const [registerEmailNewsletter, setRegisterEmailNewsletter] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
    const termsScrollRef = useRef(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router       = useRouter();
    const searchParams = useSearchParams();

    // Read errors that NextAuth injects through the query string (?error=...)
    useEffect(() => {
        const urlError = searchParams.get("error");
        if (urlError) {
            if (urlError === "PENDING") {
                setError("Your account is awaiting WBCT team approval.");
            } else if (urlError === "REJECTED") {
                setError("Registration rejected. Please contact support.");
            } else if (urlError === "CredentialsSignin") {
                setError("Incorrect email or password.");
            } else if (urlError) {
                setError("Could not sign in. Check your credentials.");
            }
        }
        if (searchParams.get("mode") === "register") {
            setIsRegisterMode(true);
        }
    }, [searchParams]);

    useEffect(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
    }, []);

    useEffect(() => {
        if (!showTermsModal) return;
        const el = termsScrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 24) {
            setTermsScrolledToEnd(true);
        }
    }, [showTermsModal]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setPendingApprovalView(false);
        if (!loginEmail.trim() || !loginPassword.trim()) {
            setError("Fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            try {
                const verifyRes = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: loginEmail.trim(),
                        password: loginPassword,
                    }),
                });

                if (!verifyRes.ok) {
                    const verifyData = await verifyRes.json().catch(() => ({}));
                    const verifyError = String(verifyData.error || "").toLowerCase();

                    if (verifyRes.status === 403 && (verifyError.includes("approv") || verifyError.includes("aprova"))) {
                        setIsRegisterMode(true);
                        setRegisterStep(1);
                        setPendingApprovalView(true);
                        return;
                    }

                    if (verifyRes.status === 403 && (verifyError.includes("reject") || verifyError.includes("recus"))) {
                        setError("Registration rejected. Please contact support.");
                        return;
                    }

                    if (verifyRes.status === 401) {
                        setError("Incorrect email or password.");
                        return;
                    }

                    setError("Could not validate access. Try again.");
                    return;
                }
            } catch {
                // Fallback: se a prevalidacao falhar por rede, tenta o signIn direto.
            }

            const result = await signIn("credentials", {
                redirect: false,
                email:    loginEmail.trim(),
                password: loginPassword,
            });

            if (result?.error) {
                const err = result.error;
                if (err === "PENDING" || err.toLowerCase().includes("pending") || err.toLowerCase().includes("aprovação") || err.toLowerCase().includes("aguarda")) {
                    setIsRegisterMode(true);
                    setRegisterStep(1);
                    setPendingApprovalView(true);
                } else if (err === "REJECTED" || err.toLowerCase().includes("rejected") || err.toLowerCase().includes("recusad")) {
                    setError("Registration rejected. Please contact support.");
                } else {
                    setError("Incorrect email or password.");
                }
                return;
            }

            const session = await getSession();
            if (session?.user) {
                router.push(session.user.role === "ADMIN" ? "/admin" : "/member");
            } else {
                setError("Incorrect email or password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Connection error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const goToStep = (step) => {
        setError("");
        setRegisterStep(step);
    };

    const handleStepSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (registerStep === 1) {
            if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
                setError("Fill in all required fields.");
                return;
            }
            if (registerPassword.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
            setRegisterStep(2);
            return;
        }

        if (registerStep === 2) {
            setRegisterStep(3);
            return;
        }

        if (registerStep === 3) {
            if (anyUploading) {
                setError("Wait for your files to finish uploading before continuing.");
                return;
            }
            const docError = validateDocuments();
            if (docError) {
                setError(docError);
                return;
            }
            setRegisterStep(4);
            return;
        }

        handleRegister(e);
    };

    const uploadOne = async (file, kind) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("context", "application");
        fd.append("applicationId", applicationId);
        if (kind) fd.append("kind", kind);
        const res = await fetch("/api/upload?context=application", {
            method: "POST",
            body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Upload failed.");
        }
        return data.url;
    };

    const handleSingleDocChange = async (key, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        if (!isAllowedDoc(file)) {
            setError("Only PDF, DOC, or DOCX files are accepted for this field.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_DOC_BYTES) {
            setError("File too large. Maximum size: 10 MB.");
            e.target.value = "";
            return;
        }
        setDocuments((prev) => ({
            ...prev,
            [key]: { file, url: "", uploading: true, error: "" },
        }));
        try {
            const url = await uploadOne(file, "doc");
            setDocuments((prev) => ({
                ...prev,
                [key]: { file, url, uploading: false, error: "" },
            }));
        } catch (err) {
            setDocuments((prev) => ({
                ...prev,
                [key]: { file: null, url: "", uploading: false, error: err.message },
            }));
        } finally {
            e.target.value = "";
        }
    };

    const handlePictureChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        if (!isAllowedPicture(file)) {
            setError("Picture must be JPG, JPEG, PNG, or WebP.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_PICTURE_BYTES) {
            setError("Picture too large. Maximum size: 10 MB.");
            e.target.value = "";
            return;
        }
        setDocuments((prev) => ({
            ...prev,
            picture: { file, url: "", uploading: true, error: "" },
        }));
        try {
            const url = await uploadOne(file, "image");
            setDocuments((prev) => ({
                ...prev,
                picture: { file, url, uploading: false, error: "" },
            }));
        } catch (err) {
            setDocuments((prev) => ({
                ...prev,
                picture: { file: null, url: "", uploading: false, error: err.message },
            }));
        } finally {
            e.target.value = "";
        }
    };

    const handleAdditionalChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setError("");
        for (const f of files) {
            if (!isAllowedDoc(f)) {
                setError("Additional files must be PDF, DOC, or DOCX.");
                e.target.value = "";
                return;
            }
            if (f.size > MAX_DOC_BYTES) {
                setError("One of the additional files is too large (max 10 MB).");
                e.target.value = "";
                return;
            }
        }
        const placeholders = files.map((f) => ({ file: f, url: "", uploading: true, error: "" }));
        setDocuments((prev) => ({
            ...prev,
            additionalFiles: [...prev.additionalFiles, ...placeholders],
        }));
        e.target.value = "";

        for (let i = 0; i < files.length; i += 1) {
            const f = files[i];
            try {
                const url = await uploadOne(f, "doc");
                setDocuments((prev) => {
                    const next = [...prev.additionalFiles];
                    const targetIdx = next.findIndex((entry) => entry.file === f && entry.uploading && !entry.url);
                    if (targetIdx === -1) return prev;
                    next[targetIdx] = { file: f, url, uploading: false, error: "" };
                    return { ...prev, additionalFiles: next };
                });
            } catch (err) {
                setDocuments((prev) => {
                    const next = [...prev.additionalFiles];
                    const targetIdx = next.findIndex((entry) => entry.file === f && entry.uploading && !entry.url);
                    if (targetIdx === -1) return prev;
                    next[targetIdx] = { file: null, url: "", uploading: false, error: err.message };
                    return { ...prev, additionalFiles: next };
                });
            }
        }
    };

    const removeAdditional = (idx) => {
        setDocuments((prev) => ({
            ...prev,
            additionalFiles: prev.additionalFiles.filter((_, i) => i !== idx),
        }));
    };

    const clearSingleDoc = (key) => {
        setDocuments((prev) => ({
            ...prev,
            [key]: { file: null, url: "", uploading: false, error: "" },
        }));
    };

    const isDocReady = (key) => Boolean(documents[key]?.url);

    const validateDocuments = () => {
        if (applicationType === "MEMBER") {
            if (!isDocReady("cv")) return "Upload your CV with list of publications.";
            if (!isDocReady("proofOfActivity")) return "Upload proof of current professional activity as a foot & ankle or knee surgeon.";
            if (!isDocReady("motivationLetter")) return "Upload your motivation letter.";
        } else if (applicationType === "ACADEMIC_AFFILIATE") {
            if (!isDocReady("cv")) return "Upload your CV with list of publications.";
            if (!isDocReady("motivationLetter")) return "Upload your motivation letter.";
        }
        return null;
    };

    const anyUploading =
        documents.cv.uploading ||
        documents.proofOfActivity.uploading ||
        documents.motivationLetter.uploading ||
        documents.picture.uploading ||
        documents.additionalFiles.some((f) => f.uploading);

    const openTermsModal = () => {
        setTermsScrolledToEnd(false);
        setShowTermsModal(true);
    };

    const handleTermsScroll = (e) => {
        const el = e.target;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
            setTermsScrolledToEnd(true);
        }
    };

    const acceptTerms = () => {
        setRegisterTermsAccepted(true);
        setShowTermsModal(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!registerTermsAccepted) {
            setError("You must agree to the Terms of Use and Privacy Policy to continue.");
            return;
        }
        if (anyUploading) {
            setError("Wait for your files to finish uploading before submitting.");
            return;
        }
        const docError = validateDocuments();
        if (docError) {
            setError(docError);
            return;
        }

        setLoading(true);
        try {
            const applicationDocuments = {};
            if (documents.cv.url) applicationDocuments.cv = documents.cv.url;
            if (documents.proofOfActivity.url) applicationDocuments.proofOfActivity = documents.proofOfActivity.url;
            if (documents.motivationLetter.url) applicationDocuments.motivationLetter = documents.motivationLetter.url;
            if (documents.picture.url) applicationDocuments.picture = documents.picture.url;
            const additionalUrls = documents.additionalFiles.map((f) => f.url).filter(Boolean);
            if (additionalUrls.length) applicationDocuments.additionalFiles = additionalUrls;

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: registerName, email: registerEmail,
                    password: registerPassword, crm: registerCRM,
                    specialty: registerSpecialty, bio: registerBio,
                    termsAccepted: registerTermsAccepted,
                    emailNewsletter: registerEmailNewsletter,
                    applicationType,
                    applicationDocuments,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not create account.");
            } else {
                setRegistrationSuccess(true);
            }
        } catch {
            setError("Could not register. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(prev => !prev);
        setError("");
        setRegisterStep(1);
        setRegistrationSuccess(false);
        setPendingApprovalView(false);
        setApplicationType("MEMBER");
        setDocuments({
            cv: { file: null, url: "", uploading: false, error: "" },
            proofOfActivity: { file: null, url: "", uploading: false, error: "" },
            motivationLetter: { file: null, url: "", uploading: false, error: "" },
            picture: { file: null, url: "", uploading: false, error: "" },
            additionalFiles: [],
        });
        setRegisterTermsAccepted(false);
        setRegisterEmailNewsletter(false);
    };

    const registerCardHeightClass = isRegisterMode
        ? ({
            1: 'md:h-[600px]',
            2: 'md:h-[600px]',
            3: 'md:h-[min(92vh,760px)]',
            4: 'md:h-[min(90vh,660px)]',
        }[registerStep] || 'md:h-[600px]')
        : 'md:h-[600px]';

    const docField = (key, label, helper) => (
        <div className="bg-surface-subtle border border-border-default rounded-lg p-2.5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                        <FileText size={11} className="text-brand-primary shrink-0" />
                        {label} <span className="text-status-error">*</span>
                    </p>
                    {helper && <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{helper}</p>}
                    {documents[key].file && (
                        <p className="text-[10px] text-text-secondary mt-1 truncate">
                            {documents[key].file.name}
                            {documents[key].url && <span className="text-status-success ml-1">· uploaded</span>}
                        </p>
                    )}
                    {documents[key].error && (
                        <p className="text-[10px] text-status-error mt-1">{documents[key].error}</p>
                    )}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                    {documents[key].uploading ? (
                        <Loader2 size={14} className="animate-spin text-brand-primary" />
                    ) : documents[key].url ? (
                        <button
                            type="button"
                            onClick={() => clearSingleDoc(key)}
                            className="p-1 rounded-md text-text-muted hover:text-status-error hover:bg-status-error-bg transition-colors"
                            aria-label={`Replace ${label}`}
                        >
                            <XIcon size={13} />
                        </button>
                    ) : (
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full cursor-pointer hover:bg-emerald-600 transition-colors">
                            <Upload size={10} />
                            Upload
                            <input
                                type="file"
                                accept={DOC_ACCEPT}
                                className="hidden"
                                onChange={(e) => handleSingleDocChange(key, e)}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-surface-section flex flex-col items-center justify-center gap-4 py-8 px-3 sm:px-4 relative transition-colors duration-300">

            {/* Card principal */}
            <div className={`relative w-full max-w-[900px] bg-surface-card rounded-xl sm:rounded-2xl shadow-modal overflow-hidden border border-border-default flex flex-col md:block transition-all duration-300 ${registerCardHeightClass}`}>

                {/* ── Formulário de Login ── */}
                <div className={`relative md:absolute top-0 left-0 w-full md:w-1/2 h-auto md:h-full flex flex-col overflow-hidden px-4 sm:px-8 py-7 sm:py-10 transition-all duration-700 ${isRegisterMode ? 'hidden md:flex md:opacity-0 md:translate-x-full pointer-events-none' : 'flex md:opacity-100 md:translate-x-0 z-10'}`}>
                    <form
                        onSubmit={handleLogin}
                        className="flex flex-col my-auto max-w-sm mx-auto w-full gap-5"
                        suppressHydrationWarning
                    >

                        <div className="text-center">
                            <img src="/logo.png" alt="WBCT" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 object-contain" />
                            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">Access Platform</h2>
                            <p className="text-xs text-text-muted mt-1">Welcome back to the WBCT community</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <FormField icon={Mail}>
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </FormField>

                            <FormField icon={Lock}>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(v => !v)}
                                    className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
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
                            {loading ? <Spinner size="sm" /> : "Sign in"}
                        </button>

                        <div className="text-center md:hidden pt-2">
                            <p className="text-text-muted text-xs mb-1.5">Do not have an account yet?</p>
                            <button type="button" onClick={toggleMode} className="text-brand-primary font-semibold text-sm hover:text-brand-primary-hover">
                                Create account
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Formulário de Registro ── */}
                <div className={`relative md:absolute top-0 left-0 md:left-1/2 w-full md:w-1/2 h-auto md:h-full flex flex-col overflow-hidden px-4 sm:px-8 py-7 sm:py-10 transition-all duration-700 ${!isRegisterMode ? 'hidden md:flex md:opacity-0 md:-translate-x-full pointer-events-none' : 'flex md:opacity-100 md:translate-x-0 z-10'}`}>

                    {/* Tela de sucesso */}
                    {(registrationSuccess || pendingApprovalView) ? (
                        <div className="flex flex-col items-center justify-center my-auto text-center animate-scale-in max-w-sm mx-auto w-full">
                            <div className="w-16 h-16 rounded-2xl bg-status-success-bg flex items-center justify-center mb-5">
                                <CheckCircle size={32} className="text-status-success" />
                            </div>
                            <h2 className="font-display text-xl font-bold text-text-primary mb-2">Registration received!</h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-xs">
                                Your data has been submitted for review.<br />
                                <strong className="text-brand-primary">Please wait for WBCT team approval.</strong>{" "}
                                You will receive access as soon as your profile is validated.
                            </p>
                            <button
                                onClick={toggleMode}
                                className="btn-secondary px-6 py-2 rounded-lg text-sm font-semibold"
                            >
                                Back to login
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleStepSubmit}
                            className="flex flex-col my-auto max-w-sm mx-auto w-full gap-3"
                            suppressHydrationWarning
                        >

                            {/* Header com steps */}
                            <div className="text-center">
                                <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">Create account</h2>
                                <div className="flex items-center justify-center gap-1.5 mt-3">
                                    {Array.from({ length: TOTAL_REGISTER_STEPS }, (_, i) => i + 1).map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                registerStep === s
                                                    ? 'w-8 bg-brand-primary'
                                                    : s < registerStep
                                                        ? 'w-3 bg-brand-primary-light'
                                                        : 'w-3 bg-surface-subtle'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-text-muted mt-1.5">
                                    Step {registerStep} of {TOTAL_REGISTER_STEPS} - {STEP_LABELS[registerStep]}
                                </p>
                            </div>

                            {/* Passo 1 */}
                            {registerStep === 1 && (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    <FormField icon={User}>
                                        <input
                                            type="text"
                                            placeholder="Full name"
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
                                            placeholder="Password (min. 6 characters)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegisterPassword(v => !v)}
                                            className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                                            aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                        >
                                            {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </FormField>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <button
                                        type="submit"
                                        className="btn-primary w-full justify-center py-2.5 rounded-lg text-sm font-bold gap-2"
                                    >
                                        Next <ArrowRight size={15} />
                                    </button>
                                </div>
                            )}

                            {/* Passo 2 — Perfil profissional */}
                            {registerStep === 2 && (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField icon={Briefcase}>
                                            <input
                                                type="text"
                                                placeholder="Medical License/State"
                                                className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                                value={registerCRM}
                                                onChange={(e) => setRegisterCRM(e.target.value)}
                                                autoFocus
                                            />
                                        </FormField>
                                        <FormField icon={Stethoscope}>
                                            <input
                                                type="text"
                                                placeholder="Specialty"
                                                className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                                                value={registerSpecialty}
                                                onChange={(e) => setRegisterSpecialty(e.target.value)}
                                            />
                                        </FormField>
                                    </div>

                                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-surface-subtle border border-border-default focus-within:border-brand-primary transition-colors">
                                        <FileText size={17} className="text-text-muted shrink-0 mt-0.5" />
                                        <textarea
                                            placeholder="Short bio (optional)"
                                            className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted resize-none h-16"
                                            value={registerBio}
                                            onChange={(e) => setRegisterBio(e.target.value)}
                                        />
                                    </div>

                                    {/* Application type toggle */}
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                                            Application Type <span className="text-status-error">*</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setApplicationType("MEMBER")}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                    applicationType === "MEMBER"
                                                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30"
                                                        : "bg-surface-subtle text-text-secondary border-border-default hover:border-brand-primary/50"
                                                }`}
                                            >
                                                <UserPlus size={13} />
                                                Member
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setApplicationType("ACADEMIC_AFFILIATE")}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                    applicationType === "ACADEMIC_AFFILIATE"
                                                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30"
                                                        : "bg-surface-subtle text-text-secondary border-border-default hover:border-brand-primary/50"
                                                }`}
                                            >
                                                <GraduationCap size={13} />
                                                Academic Affiliate
                                            </button>
                                        </div>
                                    </div>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => goToStep(1)}
                                            className="btn-secondary w-10 h-10 sm:w-11 sm:h-11 p-0 justify-center rounded-lg shrink-0"
                                            aria-label="Back"
                                        >
                                            <ArrowLeft size={17} />
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary flex-1 justify-center py-2.5 rounded-lg text-sm font-bold gap-2"
                                        >
                                            Next <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Passo 3 — Documentos */}
                            {registerStep === 3 && (
                                <div className="flex flex-col gap-2.5 animate-fade-in">
                                    {/* Required documents */}
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                            Required Documents
                                        </p>
                                        {docField("cv", "CV with list of publications", "PDF, DOC, or DOCX. Max 10 MB.")}
                                        {applicationType === "MEMBER" && docField(
                                            "proofOfActivity",
                                            "Proof of activity (foot & ankle / knee surgeon)",
                                            "PDF, DOC, or DOCX. Max 10 MB."
                                        )}
                                        {docField("motivationLetter", "Motivation Letter", "PDF, DOC, or DOCX. Max 10 MB.")}
                                    </div>

                                    {/* Optional picture */}
                                    <div className="bg-surface-subtle border border-border-default rounded-lg p-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                                                    <User size={11} className="text-brand-primary shrink-0" />
                                                    Picture (optional)
                                                </p>
                                                <p className="text-[10px] text-text-muted mt-0.5 leading-snug">JPG, PNG, or WebP. Max 10 MB.</p>
                                                {documents.picture.file && (
                                                    <p className="text-[10px] text-text-secondary mt-1 truncate">
                                                        {documents.picture.file.name}
                                                        {documents.picture.url && <span className="text-status-success ml-1">· uploaded</span>}
                                                    </p>
                                                )}
                                                {documents.picture.error && (
                                                    <p className="text-[10px] text-status-error mt-1">{documents.picture.error}</p>
                                                )}
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1">
                                                {documents.picture.uploading ? (
                                                    <Loader2 size={14} className="animate-spin text-brand-primary" />
                                                ) : documents.picture.url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearSingleDoc("picture")}
                                                        className="p-1 rounded-md text-text-muted hover:text-status-error hover:bg-status-error-bg transition-colors"
                                                        aria-label="Replace picture"
                                                    >
                                                        <XIcon size={13} />
                                                    </button>
                                                ) : (
                                                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full cursor-pointer hover:bg-emerald-600 transition-colors">
                                                        <Upload size={10} />
                                                        Upload
                                                        <input
                                                            type="file"
                                                            accept={PICTURE_ACCEPT}
                                                            className="hidden"
                                                            onChange={handlePictureChange}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => goToStep(2)}
                                            className="btn-secondary w-10 h-10 sm:w-11 sm:h-11 p-0 justify-center rounded-lg shrink-0"
                                            aria-label="Back"
                                        >
                                            <ArrowLeft size={17} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={anyUploading}
                                            className="btn-primary flex-1 justify-center py-2.5 rounded-lg text-sm font-bold gap-2 disabled:opacity-50"
                                        >
                                            Next <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Passo 4 — Arquivos extras e consentimento */}
                            {registerStep === 4 && (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    {/* Additional files */}
                                    <div className="bg-surface-subtle border border-border-default rounded-lg p-2.5 space-y-1.5">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                            Additional Files (optional)
                                        </p>
                                        {documents.additionalFiles.length > 0 && (
                                            <ul className="space-y-1">
                                                {documents.additionalFiles.map((f, idx) => (
                                                    <li
                                                        key={`${f.file?.name || idx}-${idx}`}
                                                        className="flex items-center gap-1.5 text-[10px] text-text-secondary"
                                                    >
                                                        <FileText size={11} className="text-brand-primary shrink-0" />
                                                        <span className="truncate flex-1">
                                                            {f.file?.name || "file"}
                                                            {f.url && <span className="text-status-success ml-1">· uploaded</span>}
                                                        </span>
                                                        {f.uploading ? (
                                                            <Loader2 size={11} className="animate-spin text-brand-primary" />
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAdditional(idx)}
                                                                className="text-text-muted hover:text-status-error"
                                                                aria-label="Remove file"
                                                            >
                                                                <XIcon size={11} />
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-card border border-border-default text-text-secondary text-[10px] font-bold uppercase tracking-wider rounded-full cursor-pointer hover:border-brand-primary/50 transition-colors">
                                            <Upload size={10} />
                                            Add File
                                            <input
                                                ref={additionalInputRef}
                                                type="file"
                                                multiple
                                                accept={DOC_ACCEPT}
                                                className="hidden"
                                                onChange={handleAdditionalChange}
                                            />
                                        </label>
                                    </div>

                                    {/* Consentimentos LGPD */}
                                    <div className="space-y-1.5 pt-0.5">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={registerTermsAccepted}
                                                onClick={(e) => {
                                                    if (!registerTermsAccepted) {
                                                        e.preventDefault();
                                                        openTermsModal();
                                                    }
                                                }}
                                                onChange={(e) => setRegisterTermsAccepted(e.target.checked)}
                                                className="mt-0.5 accent-brand-primary shrink-0 cursor-pointer"
                                            />
                                            <span className="text-[11px] text-text-secondary leading-relaxed">
                                                I have read and agree to the{" "}
                                                <Link href="/termos-de-uso" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand-primary hover:underline">Terms of Use</Link>
                                                {" "}and{" "}
                                                <Link href="/politica-de-privacidade" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand-primary hover:underline">Privacy Policy</Link>
                                                {" "}*
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={registerEmailNewsletter}
                                                onChange={(e) => setRegisterEmailNewsletter(e.target.checked)}
                                                className="mt-0.5 accent-brand-primary shrink-0"
                                            />
                                            <span className="text-[11px] text-text-secondary leading-relaxed">
                                                I agree to receive WBCT Society communications — optional
                                            </span>
                                        </label>
                                    </div>

                                    <ErrorMessage message={isRegisterMode ? error : ""} />

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => goToStep(3)}
                                            className="btn-secondary w-10 h-10 sm:w-11 sm:h-11 p-0 justify-center rounded-lg shrink-0"
                                            aria-label="Back"
                                        >
                                            <ArrowLeft size={17} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || anyUploading}
                                            className="btn-primary flex-1 justify-center py-2.5 rounded-lg text-sm font-bold gap-2 disabled:opacity-50"
                                        >
                                            {loading ? <Spinner size="sm" /> : "Finish registration"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center md:hidden">
                                <p className="text-text-muted text-xs mb-1.5">Already have an account?</p>
                                <button type="button" onClick={toggleMode} className="text-brand-primary font-semibold text-sm hover:text-brand-primary-hover">
                                    Sign in
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
                                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                                    <img src="/logo.png" alt="WBCT" className="w-16 h-16 rounded-md object-contain" />
                                </div>
                                <h2 className="font-display text-3xl font-bold !text-white leading-tight">
                                    Hello, Member!
                                </h2>
                                <p className="!text-white text-sm mt-3 leading-relaxed max-w-[220px]">
                                    Enter your professional credentials and access the exclusive WBCT medical community.
                                </p>
                            </div>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-brand-primary-active transition-all duration-150"
                            >
                                Create account
                            </button>
                        </div>

                        {/* Conteúdo — modo REGISTRO (mostra convite p/ login) */}
                        <div className={`absolute w-full h-full flex flex-col items-center justify-center px-10 text-center transition-all duration-500 ${isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                            <div className="mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                                    <img src="/logo.png" alt="WBCT" className="w-16 h-16 rounded-md object-contain" />
                                </div>
                                <div className="text-xs text-white/60 uppercase tracking-widest mb-5">
                                    Medical Platform
                                </div>
                                <h2 className="font-display text-2xl font-bold !text-white leading-tight">
                                    Welcome back!
                                </h2>
                                <p className="!text-white text-sm mt-3 leading-relaxed max-w-[220px]">
                                    Already part of the community? Access your account and stay connected.
                                </p>
                            </div>
                            <button
                                onClick={toggleMode}
                                className="border-2 border-white text-white px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-brand-primary-active transition-all duration-150"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] sm:text-xs text-text-muted select-none px-3 text-center">
                © {new Date().getFullYear()} WBCT · Built by Criativa Digital + Constantino.dev
            </p>

            {showTermsModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
                    onClick={() => setShowTermsModal(false)}
                >
                    <div
                        className="w-full max-w-lg bg-surface-card rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border-default shrink-0">
                            <h3 className="text-lg font-black text-text-primary">Terms of Use &amp; Privacy Policy</h3>
                            <button
                                type="button"
                                onClick={() => setShowTermsModal(false)}
                                className="text-text-muted hover:text-text-primary transition-colors"
                                aria-label="Close"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div
                            ref={termsScrollRef}
                            onScroll={handleTermsScroll}
                            className="p-5 overflow-y-auto text-sm text-text-secondary leading-relaxed space-y-4 flex-1"
                        >
                            <section className="space-y-1.5">
                                <h4 className="font-bold text-text-primary">Terms of Use</h4>
                                <p>By using the platform, you declare that you have read, understood, and accepted these terms and the Privacy Policy.</p>
                                <p>The user is responsible for keeping their account and password confidential, as well as for all activity performed under their account.</p>
                                <p>Publishing illegal, offensive, misleading content or content that violates third-party rights is prohibited.</p>
                                <p>WBCT may suspend or remove accounts in case of violation of these terms.</p>
                            </section>
                            <section className="space-y-1.5">
                                <h4 className="font-bold text-text-primary">Privacy Policy</h4>
                                <p>WBCT collects and processes your personal data — including the professional documents submitted with your application — solely to evaluate your membership application and operate the platform, in accordance with the LGPD.</p>
                                <p>Your data will not be shared with third parties except as required to process your application or comply with legal obligations.</p>
                                <p>You may request access, correction, or deletion of your personal data at any time by contacting info@wbctsociety.org.</p>
                            </section>
                            <p className="text-xs text-text-muted pt-2">
                                Read the full{" "}
                                <Link href="/termos-de-uso" target="_blank" className="text-brand-primary hover:underline">Terms of Use</Link>
                                {" "}and{" "}
                                <Link href="/politica-de-privacidade" target="_blank" className="text-brand-primary hover:underline">Privacy Policy</Link>
                                {" "}pages for complete details.
                            </p>
                        </div>

                        <div className="p-5 border-t border-border-default shrink-0 flex items-center justify-between gap-3">
                            <p className="text-[11px] text-text-muted">
                                {termsScrolledToEnd ? "You've read the full text." : "Scroll to the end to enable Accept."}
                            </p>
                            <button
                                type="button"
                                disabled={!termsScrolledToEnd}
                                onClick={acceptTerms}
                                className={`px-6 py-2.5 rounded-md font-bold text-sm uppercase tracking-wider transition-all shrink-0 ${
                                    termsScrolledToEnd
                                        ? "bg-brand-primary hover:bg-emerald-600 text-white shadow-lg shadow-brand-primary/30 cursor-pointer"
                                        : "bg-surface-subtle text-text-muted cursor-not-allowed"
                                }`}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
