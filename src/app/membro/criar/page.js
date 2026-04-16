"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Send,
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    FileText
} from "lucide-react";
import dynamic from "next/dynamic";

const TextEditor = dynamic(() => import("@/components/TextEditor"), {
    ssr: false,
    loading: () => (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-primary-500" size={32} />
                <span className="text-xs font-bold text-slate-400">Loading editor...</span>
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
                setImage(data.url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setError("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, image }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push("/membro"), 3000);
            } else {
                setError(data.error || "Error submitting post.");
            }
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 size={56} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Post Submitted!</h2>
                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                    Excellent contribution. Your post has been sent for review and will soon be available in the community feed.
                </p>
                <Link href="/membro" className="btn-primary mt-10 px-10">
                    Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link
                        href="/membro"
                        className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition-colors group mb-4"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Feed
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Share your <span className="text-primary-600 underline underline-offset-8">Knowledge</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/membro')}
                        className="px-8 py-3 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Post Title</label>
                            <input
                                type="text"
                                className="input text-lg font-bold"
                                placeholder="What's the topic of your reflection?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Publication Content</label>
                            <TextEditor
                                initialContent={content}
                                onChange={(html) => setContent(html)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 rounded-lg flex items-center justify-center gap-3 text-lg group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Publish for Review
                                    <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar: Image Upload + Tips */}
                <div className="space-y-6">
                    {/* Image Upload Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <ImageIcon className="text-primary-600" size={20} />
                            </div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white">Cover Image</h4>
                        </div>

                        {image ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden group">
                                <img src={image} className="w-full h-full object-cover" alt="Capa" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setImage("")}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-primary-300 bg-primary-50/50' : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {uploading ? (
                                    <Loader2 className="animate-spin text-primary-600" size={32} />
                                ) : (
                                    <>
                                        <ImageIcon className="text-slate-300 dark:text-slate-600 mb-2" size={36} />
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Click to upload</span>
                                        <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">PNG, JPG até 5MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                        <p className="text-xs text-slate-400 text-center">Images increase engagement by 2x</p>
                    </div>

                    {/* Tips Card */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <Sparkles className="text-primary-600 dark:text-primary-400" size={20} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Elite Post Tips</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Use a catchy and direct title.",
                                "Be ethical and preserve patient image.",
                                "Add references when applicable."
                            ].map((tip, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    <span className="text-primary-600 dark:text-primary-500 font-black">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
