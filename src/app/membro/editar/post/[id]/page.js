"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    X,
    Tag,
    FolderKanban,
    Save
} from "lucide-react";
import { Spinner } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";

const TextEditor = dynamic(() => import("@/components/TextEditor"), {
    ssr: false,
    loading: () => (
        <div className="border border-border-default rounded-md bg-surface-subtle h-[320px] flex items-center justify-center">
            <Spinner size="md" />
        </div>
    )
});

export default function EditPost() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [tagsInput, setTagsInput] = useState("");
    const [isDraft, setIsDraft] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const [postRes, catRes] = await Promise.all([
                    fetch(`/api/posts/${id}`),
                    fetch("/api/admin/post-categories"),
                ]);
                const data = await postRes.json();
                if (data.success) {
                    setTitle(data.post.title);
                    setContent(data.post.content);
                    setImage(data.post.image || "");
                    setCategoryId(data.post.categoryId || "");
                    setIsDraft(data.post.status === "DRAFT");
                } else {
                    setError("Could not load the post.");
                }
                const catData = await catRes.json();
                if (catData.success) setCategories(catData.categories);
            } catch {
                setError("Connection error.");
            } finally {
                setFetching(false);
            }
        };
        if (id) fetchPost();
    }, [id]);

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
            console.error("Upload failed:", error);
            setError("Could not upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e, { asDraft = false } = {}) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Please add a title before continuing.");
            return;
        }
        setError("");
        if (asDraft) setSavingDraft(true); else setLoading(true);
        try {
            const tags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 8);
            const res = await fetch(`/api/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, content, image, categoryId, tags,
                    ...(asDraft ? { status: "DRAFT" } : {}),
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (asDraft) {
                    router.push("/member/my-posts");
                } else {
                    setSuccess(true);
                    setTimeout(() => router.push("/member/my-posts"), 2000);
                }
            } else {
                setError(data.error || "Could not update post.");
            }
        } catch {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
            setSavingDraft(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Loading publication data...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] text-center">
                <div className="w-20 h-20 bg-status-success-bg text-status-success rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 size={44} />
                </div>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Post Updated!</h2>
                <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                    Your changes were saved. The post returned to the administrator review queue.
                </p>
                <Link href="/member/my-posts" className="btn-primary mt-7 px-8">
                    Go to My Posts
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-8">
            {/* Cabeçalho */}
            <div>
                <Link
                    href="/member/my-posts"
                    className="flex items-center gap-1.5 text-text-muted text-xs font-semibold hover:text-brand-primary transition-colors group mb-3"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to My Posts
                </Link>
                <h1 className="text-xl font-display font-bold text-text-primary">
                    Edit <span className="text-brand-primary">Publication</span>
                </h1>
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
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="input"
                                    disabled={categories.length === 0}
                                >
                                    {categories.length === 0 ? (
                                        <option value="">No categories available</option>
                                    ) : categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
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
                                    placeholder="Ex: review, case-report"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Cover Image</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-md cursor-pointer transition-all ${image ? "border-brand-primary/30 bg-brand-primary-light/20" : "border-border-default hover:border-brand-primary hover:bg-surface-subtle"}`}>
                                    {uploading ? (
                                        <Spinner size="md" />
                                    ) : (
                                        <>
                                            <ImageIcon className="text-text-muted mb-1.5" size={28} />
                                            <span className="text-xs font-semibold text-text-muted">Change Image</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {image && (
                                    <div className="relative h-36 rounded-md overflow-hidden group">
                                        <img src={image} className="w-full h-full object-cover" alt="Cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImage("")}
                                            className="absolute top-2 right-2 p-1.5 bg-status-error text-white rounded shadow"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Post Content</label>
                            <TextEditor initialContent={content} onChange={setContent} />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between">
                            {isDraft ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, { asDraft: true })}
                                        disabled={loading || savingDraft}
                                        className="btn-secondary w-full sm:w-auto justify-center flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {savingDraft ? <Spinner size="sm" /> : <><Bookmark size={15} /> Save draft</>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, { asDraft: false })}
                                        disabled={loading || savingDraft}
                                        className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Spinner size="sm" /> : <>Submit for review <ArrowRight size={15} /></>}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Spinner size="sm" /> : <><Save size={15} /> Save Changes</>}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="bg-brand-strong rounded-lg p-5 text-white space-y-3">
                        <div className="p-2 bg-brand-primary/20 rounded-md w-fit">
                            <Sparkles className="text-brand-primary" size={18} />
                        </div>
                        <h3 className="text-sm font-bold">Review Notice</h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                            When you edit a post, it automatically returns to <strong className="text-white/80">Pending</strong> status so administrators can review the new content before it is published again.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
