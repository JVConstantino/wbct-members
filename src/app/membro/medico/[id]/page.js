"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    Stethoscope,
    Mail,
    FileText,
    Calendar,
    MessageSquare,
    Award,
    ChevronRight,
    User,
    Image as ImageIcon
} from "lucide-react";

export default function DoctorProfilePage({ params }) {
    const { id } = use(params);
    const [doctor, setDoctor] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados Sociais
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [chatLoading, setChatLoading] = useState(true);

    const messagesEndRef = useState(null); // Ref para scroll automático

    // Scroll para última mensagem
    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages, showChat]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch doctor data
                const doctorRes = await fetch(`/api/users/public/${id}`);
                const doctorData = await doctorRes.json();
                if (doctorData.success) {
                    setDoctor(doctorData.user);
                    setIsFollowing(doctorData.user.isFollowing || false);
                }

                // Fetch doctor posts
                const postsRes = await fetch(`/api/posts?authorId=${id}&status=APPROVED`);
                const postsData = await postsRes.json();
                if (postsData.success) {
                    setPosts(postsData.posts);
                }

                // Verificar status de follow (neste MVP, assumimos false inicial ou implementamos check depois)
                // Para simplificar, o botão fará toggle e a API retornará o novo estado.

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // Carregar mensagens quando abrir o chat
    useEffect(() => {
        if (showChat && id) {
            const fetchMessages = async () => {
                setChatLoading(true);
                try {
                    const res = await fetch(`/api/messages/${id}`);
                    const data = await res.json();
                    if (data.success) {
                        setMessages(data.messages);
                    }
                } catch (error) {
                    console.error("Error loading messages:", error);
                } finally {
                    setChatLoading(false);
                }
            };
            fetchMessages();
            // Polling simples para novas mensagens (a cada 5s)
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [showChat, id]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await fetch("/api/users/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: id })
            });
            const data = await res.json();
            if (data.success) {
                setIsFollowing(data.isFollowing);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error following:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: id, content: newMessage })
            });
            const data = await res.json();
            if (data.success) {
                // Adicionar mensagem localmente para UI instantânea
                setMessages(prev => [...prev, {
                    id: data.messageId,
                    content: newMessage,
                    senderId: "me",
                    createdAt: new Date().toISOString()
                }]);
                setNewMessage("");
            } else {
                console.error("API Error:", data.error);
                alert(`Falha ao enviar: ${data.error}`);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Carregando perfil...</p>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="text-center py-20">
                <User className="mx-auto text-slate-300 mb-4" size={64} />
                <h2 className="text-2xl font-black text-slate-400">Médico não encontrado</h2>
                <Link href="/membro/diretorio" className="text-primary-600 font-bold mt-4 inline-block">
                    ← Voltar ao Diretório
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 relative">
            {/* Botão Voltar */}
            <Link
                href="/membro/diretorio"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Diretório
            </Link>

            {/* Header / Perfil */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-primary-900 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white p-1.5 shadow-2xl overflow-hidden flex-shrink-0">
                        {doctor.image ? (
                            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-5xl font-black">
                                {doctor.name?.charAt(0) || "M"}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                                {doctor.name || "Médico"}
                            </h1>

                            {/* Botões de Ação */}
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <button
                                    onClick={() => isFollowing && setShowChat(true)}
                                    disabled={!isFollowing}
                                    title={!isFollowing ? "Siga o usuário para enviar mensagem" : "Enviar mensagem"}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all border border-white/10 ${isFollowing
                                        ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                        : "bg-white/5 text-white/40 cursor-not-allowed"
                                        }`}
                                >
                                    <MessageSquare size={16} />
                                    Mensagem
                                </button>
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${isFollowing
                                        ? "bg-slate-700 text-white hover:bg-slate-600"
                                        : "bg-primary-600 text-white hover:bg-primary-500"
                                        }`}
                                >
                                    {followLoading && <Loader2 size={16} className="animate-spin" />}
                                    {isFollowing ? "Seguindo" : "Seguir"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="flex items-center gap-1.5 bg-primary-500/20 text-primary-300 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                <Stethoscope size={14} /> Médico
                            </span>
                            {doctor.stack && (
                                <span className="flex items-center gap-1.5 bg-white/10 text-white/80 px-3 py-1 rounded-lg text-xs font-bold">
                                    <Award size={14} /> {doctor.stack}
                                </span>
                            )}
                        </div>

                        {doctor.specialty && (
                            <p className="text-white/60 font-medium mb-2">{doctor.specialty}</p>
                        )}

                        {doctor.bio && (
                            <p className="text-white/70 font-medium max-w-2xl">{doctor.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <FileText className="mx-auto text-primary-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{posts.length}</p>
                    <p className="text-sm text-slate-500">Artigos Publicados</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <Stethoscope className="mx-auto text-primary-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{doctor.stack || "N/A"}</p>
                    <p className="text-sm text-slate-500">Especialidade</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <Award className="mx-auto text-primary-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{doctor.crm || "N/A"}</p>
                    <p className="text-sm text-slate-500">CRM</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <Calendar className="mx-auto text-primary-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {new Date(doctor.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500">Membro desde</p>
                </div>
            </div>

            {/* Publicações */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Publicações</h2>
                    <span className="text-sm text-slate-500 font-medium">{posts.length} artigos</span>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-medium">No publications yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/membro/postagens/${post.id}`}
                                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Imagem */}
                                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    {post.image ? (
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                            <ImageIcon size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>

                                {/* Conteúdo */}
                                <div className="p-6 space-y-3">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{post.content}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="text-xs text-primary-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Ler <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Chat */}
            {showChat && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        {/* Header do Chat */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    {doctor.image ? (
                                        <img src={doctor.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{doctor.name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{doctor.name}</h3>
                                    <p className="text-xs text-slate-500">Médico • {doctor.stack || doctor.specialty || "Geral"}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="sr-only">Fechar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Corpo das Mensagens */}
                        <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {chatLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-primary-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>Envie a primeira mensagem para começar a conversa.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === "me" || msg.senderId !== id;
                                    return (
                                        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                            <input
                                type="text"
                                placeholder="Digite sua mensagem..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 input bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? <Loader2 size={20} className="animate-spin" /> : <ArrowLeft size={20} className="rotate-180" />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
