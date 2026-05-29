"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
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
    const [category, setCategory] = useState("OUTROS");
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
                    setError("Não foi possível carregar a postagem.");
                }
            } catch {
                setError("Erro de conexão.");
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
            console.error("Upload falhou:", error);
            setError("Erro ao enviar imagem.");
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
            const metadataBlock = `\n<hr><p><strong>Categoria:</strong> ${category}</p>${tags.length ? `<p><strong>Tags:</strong> ${tags.join(", ")}</p>` : ""}`;
            const res = await fetch(`/api/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content: `${content}${metadataBlock}`, image, category, tags }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push("/membro/minhas-postagens"), 2000);
            } else {
                setError(data.error || "Erro ao atualizar postagem.");
            }
        } catch {
            setError("Falha na conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Recuperando dados da publicação...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] text-center">
                <div className="w-20 h-20 bg-status-success-bg text-status-success rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 size={44} />
                </div>
                <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Postagem Atualizada!</h2>
                <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
                    Suas alterações foram salvas. O post retornou para a fila de revisão dos administradores.
                </p>
                <Link href="/membro/minhas-postagens" className="btn-primary mt-7 px-8">
                    Ir para Minhas Postagens
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-8">
            {/* Cabeçalho */}
            <div>
                <Link
                    href="/membro/minhas-postagens"
                    className="flex items-center gap-1.5 text-text-muted text-xs font-semibold hover:text-brand-primary transition-colors group mb-3"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar para Minhas Postagens
                </Link>
                <h1 className="text-xl font-display font-bold text-text-primary">
                    Editar <span className="text-brand-primary">Publicação</span>
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
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Título da Postagem</label>
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
                                    <FolderKanban size={13} /> Categoria
                                </label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                                    {categories.map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={13} /> Tags
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ex: revisao, caso-clinico"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Imagem de Capa</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-md cursor-pointer transition-all ${image ? "border-brand-primary/30 bg-brand-primary-light/20" : "border-border-default hover:border-brand-primary hover:bg-surface-subtle"}`}>
                                    {uploading ? (
                                        <Spinner size="md" />
                                    ) : (
                                        <>
                                            <ImageIcon className="text-text-muted mb-1.5" size={28} />
                                            <span className="text-xs font-semibold text-text-muted">Alterar Imagem</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {image && (
                                    <div className="relative h-36 rounded-md overflow-hidden group">
                                        <img src={image} className="w-full h-full object-cover" alt="Capa" />
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
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Conteúdo da Publicação</label>
                            <TextEditor initialContent={content} onChange={setContent} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Spinner size="sm" /> : <><Save size={15} /> Salvar Alterações</>}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="bg-brand-strong rounded-lg p-5 text-white space-y-3">
                        <div className="p-2 bg-brand-primary/20 rounded-md w-fit">
                            <Sparkles className="text-brand-primary" size={18} />
                        </div>
                        <h3 className="text-sm font-bold">Aviso de Revisão</h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                            Ao editar uma postagem, ela voltará automaticamente para o status de <strong className="text-white/80">Pendência</strong> para que os administradores possam revisar o novo conteúdo antes de ser publicado novamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
