"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare,
    Search,
    MoreVertical,
    Paperclip,
    Send,
    Smile,
    CheckCheck,
    ArrowLeft,
    Loader2,
    Plus,
    X,
    User,
    UserPlus
} from "lucide-react";

export default function AdminChatPage() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUserId, setCurrentUserId] = useState("");
    const [sendError, setSendError] = useState("");

    // New Chat State
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [searchUserTerm, setSearchUserTerm] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    const messagesEndRef = useRef(null);
    const loadedContactRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Initial Contacts (Recent Conversations)
    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/admin/chat/contacts");
            const data = await res.json();
            if (data.success) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error("Error loading chat contacts:", error);
        } finally {
            setLoadingContacts(false);
        }
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user?.id) setCurrentUserId(session.user.id);
            } catch {}
        };
        fetchSession();
        fetchContacts();
    }, []);

    // Fetch Messages
    useEffect(() => {
        if (selectedContact) {
            const isFirstLoadForContact = loadedContactRef.current !== selectedContact.id;
            const fetchMessages = async (showLoader = false) => {
                if (showLoader) setLoadingMessages(true);
                try {
                    const res = await fetch(`/api/messages/${selectedContact.id}`);
                    const data = await res.json();
                    if (data.success) {
                        setMessages(data.messages);
                        loadedContactRef.current = selectedContact.id;
                    }
                } catch (error) {
                    console.error("Error loading messages:", error);
                } finally {
                    if (showLoader) setLoadingMessages(false);
                }
            };

            fetchMessages(isFirstLoadForContact);
            const interval = setInterval(() => fetchMessages(false), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    // Search All Users for New Chat
    useEffect(() => {
        if (showNewChatModal) {
            const fetchAllUsers = async () => {
                setLoadingUsers(true);
                try {
                    const res = await fetch(`/api/members?search=${searchUserTerm}`);
                    const data = await res.json();
                    if (data.success) {
                        setAllUsers(data.members);
                    }
                } catch (error) {
                    console.error("Error searching users:", error);
                } finally {
                    setLoadingUsers(false);
                }
            };

            const timer = setTimeout(fetchAllUsers, 300);
            return () => clearTimeout(timer);
        }
    }, [showNewChatModal, searchUserTerm]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        const tempId = crypto.randomUUID();
        const content = newMessage.trim();
        setSendError("");

        // Optimistic Update
        setMessages(prev => [...prev, {
            id: tempId,
            content: content,
            senderId: currentUserId || "me",
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

            if (data.success) {
                setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: data.messageId || tempId } : m));
                // Refresh contacts to move this conversation to top or add if new
                fetchContacts();
            } else {
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                setNewMessage(content);
                setSendError(data.error || "Erro ao enviar mensagem.");
            }
        } catch (error) {
            console.error("Error sending:", error);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setNewMessage(content);
            setSendError("Erro de conexão ao enviar mensagem.");
        } finally {
            setSending(false);
        }
    };

    const startChatWithUser = (user) => {
        setSelectedContact(user);
        setShowNewChatModal(false);
        // Check if user is already in contacts, if not, they will be added after first message or reload
        // Ideally we might want to add them to 'contacts' list locally temporarily
        if (!contacts.find(c => c.id === user.id)) {
            setContacts(prev => [user, ...prev]);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex">

            {/* Sidebar */}
            <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-border-default bg-surface-subtle`}>

                <div className="p-4 bg-surface-card border-b border-border-default flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="font-bold text-lg text-text-primary">Admin Chat</h2>
                    </div>
                    <button
                        onClick={() => setShowNewChatModal(true)}
                        className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                        title="New Chat"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search existing conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-card rounded-lg pl-10 pr-4 py-2 text-sm border border-border-subtle focus:ring-1 ring-brand-primary outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-text-muted" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="p-8 text-center text-text-muted text-sm">
                            <p>No conversations found.</p>
                            <p className="mt-2 text-xs">Start a new chat to message any member.</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border-subtle ${selectedContact?.id === contact.id
                                    ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary'
                                    : 'hover:bg-surface-active border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-surface-subtle overflow-hidden flex-shrink-0 flex items-center justify-center text-text-muted font-bold text-lg">
                                        {contact.image ? (
                                            <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                        ) : (
                                            contact.name?.charAt(0)
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-card rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text-primary truncate">{contact.name}</h3>
                                    <p className="text-xs text-text-muted truncate">
                                        {contact.email || "Member"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedContact ? (
                <div className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-surface-subtle/30 w-full`}>

                    {/* Header */}
                    <div className="h-16 px-6 bg-surface-card border-b border-border-default flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="md:hidden p-2 -ml-2 text-text-muted hover:bg-surface-subtle rounded-full"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-surface-subtle overflow-hidden flex items-center justify-center text-text-muted font-bold">
                                {selectedContact.image ? (
                                    <img src={selectedContact.image} alt={selectedContact.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedContact.name?.charAt(0)
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary leading-tight">{selectedContact.name}</h3>
                                <p className="text-xs text-brand-primary font-medium flex items-center gap-1">
                                    {selectedContact.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted">
                            <button className="hover:text-brand-primary transition-colors"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-subtle/50">
                        {loadingMessages && messages.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-brand-primary/50" size={32} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4">
                                <div className="bg-surface-card p-4 rounded-full shadow-sm">
                                    <MessageSquare size={40} className="text-brand-primary" />
                                </div>
                                <p className="bg-surface-card px-4 py-2 rounded-lg text-sm shadow-sm backdrop-blur-sm">
                                    Start a conversation with {selectedContact.name}.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = currentUserId ? msg.senderId === currentUserId : (msg.senderId === "me" || msg.senderId !== selectedContact.id);

                                return (
                                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm text-sm relative group ${isMe
                                            ? 'bg-brand-primary text-white rounded-tr-none'
                                            : 'bg-surface-card text-text-primary border border-border-default rounded-tl-none'
                                            }`}>
                                            <p className={`leading-relaxed whitespace-pre-wrap break-words ${isMe ? '!text-white' : ''}`}>{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? '!text-white/80' : 'text-text-muted'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && <CheckCheck size={14} className="!text-white/80" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-surface-card border-t border-border-default">
                        {sendError && <p className="mb-2 text-xs text-status-error">{sendError}</p>}
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                            <button type="button" className="p-3 text-text-muted hover:text-brand-primary hover:bg-surface-subtle rounded-xl transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <div className="flex-1 bg-surface-subtle rounded-2xl border border-transparent focus-within:border-brand-primary/50 focus-within:bg-surface-card focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all flex items-end">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[48px] resize-none text-text-primary placeholder-text-muted"
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
                                <button type="button" className="p-3 text-text-muted hover:text-brand-primary transition-colors">
                                    <Smile size={20} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-brand-primary/30 transition-all active:scale-95"
                            >
                                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>

                </div>
            ) : (
                /* Empty State */
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-surface-subtle/50 text-center p-8 border-l border-border-default">
                    <div className="w-32 h-32 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={64} className="text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-text-primary mb-2">Admin Communication Hub</h2>
                    <p className="text-text-muted max-w-sm">
                        Select a conversation or start a new chat with any member.
                    </p>
                </div>
            )}

            {/* NEW CHAT MODAL */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-xl shadow-2xl w-full max-w-md border border-border-default overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-border-default flex items-center justify-between">
                            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                <UserPlus size={20} className="text-brand-primary" />
                                New Chat
                            </h3>
                            <button onClick={() => setShowNewChatModal(false)} className="p-1 hover:bg-surface-subtle rounded-full text-text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-border-default">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search for any member..."
                                    value={searchUserTerm}
                                    onChange={(e) => setSearchUserTerm(e.target.value)}
                                    autoFocus
                                    className="w-full bg-surface-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm border border-border-subtle focus:ring-1 ring-brand-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {loadingUsers ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="animate-spin text-brand-primary" />
                                </div>
                            ) : allUsers.length === 0 ? (
                                <div className="text-center p-8 text-text-muted text-sm">
                                    No members found.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {allUsers.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => startChatWithUser(user)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-surface-subtle rounded-xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-surface-active flex items-center justify-center font-bold text-text-muted group-hover:bg-white group-hover:text-brand-primary transition-colors overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary text-sm">{user.name}</p>
                                                <p className="text-xs text-text-muted">{user.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
