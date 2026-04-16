"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare,
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Send,
    Smile,
    Check,
    CheckCheck,
    ArrowLeft,
    Loader2
} from "lucide-react";

export default function ChatPage() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const messagesEndRef = useRef(null);

    // Scroll automático para última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Carregar Contatos (Quem eu sigo)
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch("/api/users/contacts");
                const data = await res.json();
                if (data.success) {
                    setContacts(data.contacts);
                }
            } catch (error) {
                console.error("Error loading contacts:", error);
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContacts();
    }, []);

    // Carregar Mensagens ao selecionar contato
    useEffect(() => {
        if (selectedContact) {
            const fetchMessages = async () => {
                setLoadingMessages(true);
                try {
                    const res = await fetch(`/api/messages/${selectedContact.id}`);
                    const data = await res.json();
                    if (data.success) {
                        setMessages(data.messages);
                    }
                } catch (error) {
                    console.error("Error loading messages:", error);
                } finally {
                    setLoadingMessages(false);
                }
            };

            fetchMessages();
            // Polling simples a cada 3s para novas mensagens
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        const tempId = crypto.randomUUID();
        const content = newMessage;

        // Optimistic Update
        setMessages(prev => [...prev, {
            id: tempId,
            content: content,
            senderId: "me",
            createdAt: new Date().toISOString()
        }]);
        setNewMessage("");
        setSending(true);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: selectedContact.id,
                    content: content
                })
            });
            const data = await res.json();
            if (!data.success) {
                // Reverter em caso de erro (simplificado: alertar usuário)
                console.error(data.error);
                alert("Error sending message.");
            }
        } catch (error) {
            console.error("Error sending:", error);
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex">

            {/* Sidebar de Contatos */}
            <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50`}>

                {/* Header Contatos */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="font-bold text-lg dark:text-white">Conversations</h2>
                    </div>
                </div>

                {/* Busca */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm border-none focus:ring-2 ring-primary-500/50"
                        />
                    </div>
                </div>

                {/* Lista de Contatos */}
                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <p>No contacts found.</p>
                            <p className="mt-2 text-xs">Follow other doctors in the Directory to start a conversation.</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 ${selectedContact?.id === contact.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                        {contact.image ? (
                                            <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {contact.stack || contact.specialty || "Médico"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Área de Chat */}
            {selectedContact ? (
                <div className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50/30 dark:bg-black/20 w-full`}>

                    {/* Chat Header */}
                    <div className="h-16 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                {selectedContact.image ? (
                                    <img src={selectedContact.image} alt={selectedContact.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                                        {selectedContact.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedContact.name}</h3>
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    Online now
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="hover:text-primary-500 transition-colors"><Search size={20} /></button>
                            <button className="hover:text-primary-500 transition-colors"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://camo.githubusercontent.com/854a93c27d64274c4f8f5a0b66b2ff8531bf69e984cc6823ca8ea4a56ea6d585/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')] bg-repeat bg-fixed opacity-[0.97] dark:opacity-50">
                        {loadingMessages ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-white/50" size={32} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                                    <MessageSquare size={40} className="text-slate-500" />
                                </div>
                                <p className="bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg text-sm shadow-sm backdrop-blur-sm">
                                    This is the beginning of your conversation with {selectedContact.name}.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.senderId === "me" || msg.senderId !== selectedContact.id;
                                const isLast = index === messages.length - 1;

                                return (
                                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm text-sm relative group ${isMe
                                            ? 'bg-primary-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                            }`}>
                                            <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && <CheckCheck size={14} className="text-primary-300" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                            <button type="button" className="p-3 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-transparent focus-within:border-primary-500/50 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all flex items-end">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[48px] resize-none text-slate-900 dark:text-white placeholder-slate-400"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                                <button type="button" className="p-3 text-slate-400 hover:text-primary-500 transition-colors">
                                    <Smile size={20} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
                            >
                                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>

                </div>
            ) : (
                /* Empty State (Desktop) */
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-center p-8 border-l border-slate-200 dark:border-slate-800">
                    <div className="w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageSquare size={64} className="text-primary-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Elite Messages</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Select a contact from the sidebar to start a secure and private conversation.
                    </p>
                    <div className="mt-8 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-full text-xs font-mono text-slate-500">
                        End-to-end encryption enabled
                    </div>
                </div>
            )}
        </div>
    );
}
