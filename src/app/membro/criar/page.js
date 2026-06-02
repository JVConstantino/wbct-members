"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Send,
    ArrowLeft,
    Image as ImageIcon,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Tag,
    FolderKanban
} from "lucide-react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Skeleton";

const TextEditor = dynamic(() => import("@/components/TextEditor"), {
    ssr: false,
    loading: () => (
        <div className="border border-border-default rounded-md bg-surface-subtle h-[320px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-xs text-text-muted">Loading editor...</span>
            </div>
        </div>
    )
});

export default function CreatePost() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState("CARDIOLOGIA");
    const [tagsInput, setTagsInput] = useState("");

    const categories = [
        "CARDIOLOGIA",
        "CLINICA_MEDICA",
        "ENDOCRINOLOGIA",
        "INFECTOLOGIA",
        "NEUROLOGIA",
        "PEDIATRIA",
        "URG_EMERGENCIA",
        "OUTROS",
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json();
            if (data.success) setImage(data.url);
        } catch (error) {
            console.error("Upload falhou:", error);
            setError("Could not upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const tags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 8);

            const metadataBlock = `\n<hr><p><strong>Category:</strong> ${category}</p>${tags.length ? `<p><strong>Tags:</strong> ${tags.join(", ")}</p>` : ""}`;
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content: `${content}${metadataBlock}`, image, category, tags }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push("/member"), 3000);
            } else {
                setError(data.error || "Could not submit post.");
            }
        } catch {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] text-center">
                <div className="w-20 h-20 bg-status-success-bg text-status-success rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={44} />
                </div>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Post Submitted!</h2>
                <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                    Great contribution! Your article was submitted for review and will soon be available in the community feed.
                </p>
                <Link href="/member" className="btn-primary mt-8 px-8">
                    Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-8">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/member"
                        className="flex items-center gap-1.5 text-text-muted text-xs font-semibold hover:text-brand-primary transition-colors group mb-3"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Feed
                    </Link>
                    <h1 className="text-xl font-display font-bold text-text-primary">
                        Share Your <span className="text-brand-primary">Knowledge</span>
                    </h1>
                    <p className="text-xs text-text-secondary mt-0.5">Publish medical articles for the WBCT community</p>
                </div>
                <button onClick={() => router.push("/member")} className="btn-secondary text-sm">
                    Cancel
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Formulário */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="bg-surface-card rounded-lg border border-border-default shadow-card p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-status-error-bg border border-status-error/20 rounded-md text-status-error text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Post Title</label>
                            <input
                                type="text"
                                className="input text-base font-semibold"
                                placeholder="What is your article about?"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <FolderKanban size={13} /> Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c.replaceAll("_", " ")}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={13} /> Tags
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ex: hipertensao, conduta, diretriz"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Content da Publication</label>
                            <TextEditor
                                initialContent={content}
                                onChange={(html) => setContent(html)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    Send for Review
                                    <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Upload de capa */}
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-brand-primary-light rounded-md">
                                <ImageIcon className="text-brand-primary" size={15} />
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary">Cover Image</h4>
                        </div>

                        {image ? (
                            <div className="relative aspect-video rounded-md overflow-hidden group">
                                <img src={image} className="w-full h-full object-cover" alt="Capa" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setImage("")}
                                        className="px-3 py-1.5 bg-status-error text-white rounded text-xs font-semibold hover:bg-status-error/90 transition-colors"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-md courser-pointer transition-all ${uploading ? "border-brand-primary/40 bg-brand-primary-light/30" : "border-border-default hover:border-brand-primary hover:bg-surface-subtle"}`}>
                                {uploading ? (
                                    <Spinner size="md" />
                                ) : (
                                    <>
                                        <ImageIcon className="text-text-muted mb-1.5" size={28} />
                                        <span className="text-xs font-semibold text-text-muted">Click to upload</span>
                                        <span className="text-[10px] text-text-muted mt-0.5">PNG, JPG up to 5MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                        <p className="text-[10px] text-text-muted text-center">Images increase engagement by 2x</p>
                    </div>

                    {/* Dicas */}
                    <div className="bg-surface-subtle rounded-lg border border-border-subtle p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-brand-primary-light rounded-md">
                                <Sparkles className="text-brand-primary" size={15} />
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">Post Tips</h3>
                        </div>
                        <ul className="space-y-2">
                            {[
                                "Use a clear and direct title.",
                                "Be ethical and preserve patient image rights.",
                                "Add bibliographic references when applicable."
                            ].map((tip, idx) => (
                                <li key={idx} className="flex gap-2 text-xs text-text-secondary leading-relaxed">
                                    <span className="text-brand-primary font-bold shrink-0">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-2 border-t border-border-subtle">
                            <p className="text-[10px] text-text-muted">
                                Tip: use 3 to 5 tags to improve discovery in the feed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
