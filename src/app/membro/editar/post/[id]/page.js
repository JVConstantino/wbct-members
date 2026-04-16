"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    Send,
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    FileText,
    Eye,
    X
} from "lucide-react";

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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/${id}`);
                const data = await res.json();
                if (data.success) {
                    setTitle(data.post.title);
                    setContent(data.post.content);
                    setImage(data.post.image || "");
                } else {
                    setError("Could not load post.");
                }
            } catch (err) {
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
            const res = await fetch(`/api/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, image }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push("/membro/minhas-postagens"), 2000);
            } else {
                setError(data.error || "Error updating post.");
            }
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Recuperando dados da publicação...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 size={56} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Postagem Atualizada!</h2>
                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                    Suas alterações foram salvas. O post retornou para a fila de revisão dos administradores.
                </p>
                <Link href="/membro/minhas-postagens" className="btn-primary mt-10 px-10">
                    Ir para Minhas Postagens
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link
                        href="/membro/minhas-postagens"
                        className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition-colors group mb-4"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para Minhas Postagens
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Editar <span className="text-primary-600 underline underline-offset-8">Publicação</span></h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Título da Postagem</label>
                            <input
                                type="text"
                                className="input text-lg font-bold"
                                placeholder="..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Imagem de Capa</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex flex-col items-center justify-center h-48 border-4 border-dashed rounded-xl cursor-pointer transition-all ${image ? 'border-primary-500/50 bg-primary-50/10' : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50'}`}>
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-primary-600" size={32} />
                                    ) : (
                                        <>
                                            <ImageIcon className="text-slate-300 mb-2" size={40} />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Alterar Imagem</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {image && (
                                    <div className="relative h-48 rounded-xl overflow-hidden group">
                                        <img src={image} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImage("")}
                                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">Conteúdo da Publicação</label>
                            <textarea
                                className="input min-h-[300px] py-6 leading-relaxed text-lg"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 rounded-lg flex items-center justify-center gap-3 text-lg group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Salvar Alterações"}
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-xl text-white space-y-6">
                        <Sparkles className="text-primary-400" size={32} />
                        <h3 className="text-xl font-black tracking-tight text-white">Aviso de Revisão</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                            Ao editar uma postagem, ela voltará automaticamente para o status de **Pendência** para que os administradores possam revisar o novo conteúdo antes de ser publicado novamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
