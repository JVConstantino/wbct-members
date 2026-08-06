"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Image as ImageIcon,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    Sparkles,
    AlertCircle,
    Tag,
    FolderKanban,
    Plus,
    X as XIcon,
    PenSquare
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
    const [savingDraft, setSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [tagsInput, setTagsInput] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categorySaving, setCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/admin/post-categories");
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                    if (data.categories.length > 0) setCategoryId(data.categories[0].id);
                }
            } catch {
                // Categories are optional for the form; admins can still submit without one.
            }
        };
        fetchCategories();
    }, []);

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

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;
        setCategorySaving(true);
        setCategoryError("");
        try {
            const res = await fetch("/api/admin/post-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.success) {
                setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
                setCategoryId(data.category.id);
                setCreatingCategory(false);
                setNewCategoryName("");
            } else {
                setCategoryError(data.error || "Could not create category.");
            }
        } catch {
            setCategoryError("Server connection failed.");
        } finally {
            setCategorySaving(false);
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

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, content, image, categoryId, tags,
                    ...(asDraft ? { status: "DRAFT" } : {}),
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (asDraft) {
                    setDraftSaved(true);
                    setTimeout(() => router.push("/member/my-posts"), 1200);
                } else {
                    setSuccess(true);
                    setTimeout(() => router.push("/member"), 3000);
                }
            } else {
                setError(data.error || "Could not submit post.");
            }
        } catch {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
            setSavingDraft(false);
        }
    };

    const plainTextContent = content.replace(/<[^>]*>/g, "").trim();
    const tagsList = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const checklist = [
        { key: "title", label: "Title", desc: "Add a clear and descriptive title.", done: title.trim().length > 0 },
        { key: "category", label: "Category", desc: "Select the most relevant category.", done: Boolean(categoryId) && categoryId !== "__new__" },
        { key: "cover", label: "Cover image", desc: "Add a high-quality cover image.", done: Boolean(image) },
        { key: "tags", label: "Tags (3-5)", desc: "Add relevant keywords.", done: tagsList.length >= 3 },
        { key: "content", label: "Content", desc: "Write at least a few paragraphs.", done: plainTextContent.length >= 150 },
    ];
    const completedCount = checklist.filter((c) => c.done).length;

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
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Cabeçalho */}
            <div>
                <Link
                    href="/member"
                    className="flex items-center gap-1.5 text-text-muted text-xs font-semibold hover:text-brand-primary transition-colors group mb-4"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Feed
                </Link>
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-brand-primary-light rounded-lg shrink-0">
                        <PenSquare className="text-brand-primary" size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Create an article</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Share clinical knowledge with the WBCT community.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Formulário */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-status-error-bg border border-status-error/20 rounded-md text-status-error text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}
                        {draftSaved && (
                            <div className="p-3 bg-status-success-bg border border-status-success/20 rounded-md text-status-success text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 size={15} />
                                Draft saved — taking you to My Posts...
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-text-primary">Article title</label>
                            <input
                                type="text"
                                className="input text-base font-semibold"
                                placeholder="Enter a clear and descriptive title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                                    <FolderKanban size={14} className="text-text-muted" /> Category
                                </label>
                                {creatingCategory ? (
                                    <div className="space-y-1.5">
                                        <div className="flex gap-1.5">
                                            <input
                                                type="text"
                                                autoFocus
                                                className="input flex-1"
                                                placeholder="New category name"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); } }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                disabled={categorySaving || !newCategoryName.trim()}
                                                className="btn-primary px-3 shrink-0 disabled:opacity-50"
                                                title="Create category"
                                            >
                                                {categorySaving ? <Spinner size="sm" /> : <Plus size={15} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setCreatingCategory(false); setNewCategoryName(""); setCategoryError(""); }}
                                                className="btn-secondary px-3 shrink-0"
                                                title="Cancel"
                                            >
                                                <XIcon size={15} />
                                            </button>
                                        </div>
                                        {categoryError && <p className="text-[11px] text-status-error font-semibold">{categoryError}</p>}
                                    </div>
                                ) : (
                                    <select
                                        value={categoryId}
                                        onChange={(e) => {
                                            if (e.target.value === "__new__") {
                                                setCreatingCategory(true);
                                            } else {
                                                setCategoryId(e.target.value);
                                            }
                                        }}
                                        className="input"
                                    >
                                        {categories.length === 0 && <option value="">No categories available</option>}
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        <option value="__new__">+ Create new category</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                                    <Tag size={14} className="text-text-muted" /> Tags
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Add up to 5 tags, comma-separated"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <TextEditor
                            initialContent={content}
                            onChange={(html) => setContent(html)}
                        />
                    </div>
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
                                <img src={image} className="w-full h-full object-cover" alt="Cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setImage("")}
                                        className="px-3 py-1.5 bg-status-error text-white rounded-md text-xs font-semibold hover:bg-status-error/90 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-md cursor-pointer transition-all ${uploading ? "border-brand-primary/40 bg-brand-primary-light/30" : "border-border-default hover:border-brand-primary hover:bg-surface-subtle"}`}>
                                {uploading ? (
                                    <Spinner size="md" />
                                ) : (
                                    <>
                                        <ImageIcon className="text-text-muted mb-1.5" size={28} />
                                        <span className="text-xs font-semibold text-text-muted">Drag & drop or click to upload</span>
                                        <span className="text-[10px] text-text-muted mt-0.5">PNG, JPG up to 5MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                        <p className="text-[10px] text-text-muted text-center">Recommended size: 1200 x 675px (16:9)</p>
                    </div>

                    {/* Article checklist */}
                    <div className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-brand-primary-light rounded-md">
                                <ClipboardCheck className="text-brand-primary" size={15} />
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary">Article checklist</h4>
                        </div>
                        <ul className="space-y-3">
                            {checklist.map((item) => (
                                <li key={item.key} className="flex items-start gap-2.5">
                                    {item.done ? (
                                        <CheckCircle2 size={16} className="text-status-success shrink-0 mt-0.5" />
                                    ) : (
                                        <Circle size={16} className="text-border-strong shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`text-xs font-semibold ${item.done ? "text-text-primary" : "text-text-secondary"}`}>{item.label}</p>
                                        <p className="text-[11px] text-text-muted">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-3 border-t border-border-subtle space-y-1.5">
                            <p className="text-[11px] font-semibold text-text-muted">{completedCount} of {checklist.length} completed</p>
                            <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-primary rounded-full transition-all"
                                    style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                                />
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e, { asDraft: true })}
                    disabled={loading || savingDraft}
                    className="btn-secondary gap-2 w-full sm:w-auto justify-center disabled:opacity-50"
                >
                    {savingDraft ? <Spinner size="sm" /> : <><Bookmark size={15} /> Save draft</>}
                </button>
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e, { asDraft: false })}
                    disabled={loading || savingDraft}
                    className="btn-primary gap-2 w-full sm:w-auto justify-center disabled:opacity-50 group"
                >
                    {loading ? <Spinner size="sm" /> : <>Submit for review <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
            </div>
        </div>
    );
}
