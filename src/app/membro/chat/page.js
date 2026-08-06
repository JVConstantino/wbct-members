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
    ArrowLeft
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";

export default function ChatPage() {
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
    const [followState, setFollowState] = useState({});
    const [followLoading, setFollowLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const loadedContactRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user?.id) setCurrentUserId(session.user.id);
            } catch {}
        };
        fetchSession();

        const fetchContacts = async () => {
            try {
                const res = await fetch("/api/users/contacts");
                const data = await res.json();
                if (data.success) setContacts(data.contacts);
            } catch (error) {
                console.error("Failed to load contacts:", error);
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!selectedContact) return;
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
                console.error("Failed to load messages:", error);
            } finally {
                if (showLoader) setLoadingMessages(false);
            }
        };
        fetchMessages(isFirstLoadForContact);
        const interval = setInterval(() => fetchMessages(false), 3000);
        return () => clearInterval(interval);
    }, [selectedContact]);

    useEffect(() => {
        if (!selectedContact?.id) return;
        const known = followState[selectedContact.id];
        if (known !== undefined) return;

        const fetchFollowState = async () => {
            try {
                const res = await fetch(`/api/users/follow?targetUserId=${selectedContact.id}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setFollowState((prev) => ({ ...prev, [selectedContact.id]: !!data.isFollowing }));
                }
            } catch {}
        };
        fetchFollowState();
    }, [selectedContact, followState]);

    const handleFollow = async () => {
        if (!selectedContact?.id) return;
        setFollowLoading(true);
        try {
            const res = await fetch("/api/users/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: selectedContact.id }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const isFollowing = !!data.isFollowing;
                setFollowState((prev) => ({ ...prev, [selectedContact.id]: isFollowing }));
                setContacts((prev) => prev.map((c) => c.id === selectedContact.id ? { ...c, isFollowing } : c));
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        const tempId = crypto.randomUUID();
        const content = newMessage.trim();
        setSendError("");
        setMessages(prev => [...prev, { id: tempId, content, senderId: currentUserId || "me", createdAt: new Date().toISOString() }]);
        setNewMessage("");
        setSending(true);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: selectedContact.id, content })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                setNewMessage(content);
                setSendError(data.error || "Failed to send message.");
                return;
            }
            setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: data.messageId || tempId } : m));
        } catch (error) {
            console.error("Failed to send:", error);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setNewMessage(content);
            setSendError("Connection error while sending message.");
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] bg-surface-card rounded-lg border border-border-default shadow-card overflow-hidden flex">
            {/* Sidebar de Contatos */}
            <div className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 flex-col border-r border-border-default bg-surface-subtle`}>
                <div className="p-4 bg-surface-card border-b border-border-default flex items-center gap-3 h-14">
                    <div className="w-8 h-8 rounded-md bg-brand-primary-light flex items-center justify-center text-brand-primary">
                        <MessageSquare size={16} />
                    </div>
                    <h2 className="font-semibold text-text-primary text-sm">Conversas</h2>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search contact..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input !pl-10 text-xs"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex justify-center p-8"><Spinner size="sm" /></div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="p-6 text-center text-text-muted text-xs">
                            <p>No contacts found.</p>
                            <p className="mt-1">Follow other members in the Directory to start conversations.</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center gap-3 p-3.5 courser-pointer transition-colors border-b border-border-subtle ${selectedContact?.id === contact.id
                                    ? "bg-brand-primary-light border-l-2 border-l-brand-primary"
                                    : "hover:bg-surface-active border-l-2 border-l-transparent"}`}
                            >
                                <Avatar src={contact.image} name={contact.name} size="md" online />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text-primary text-sm truncate">{contact.name}</h3>
                                    <p className="text-[11px] text-text-muted truncate">
                                        {contact.stack || contact.specialty || "Member"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Área de Chat */}
            {selectedContact ? (
                <div className="flex flex-1 flex-col bg-surface-subtle/30 w-full">
                    {/* Header do Chat */}
                    <div className="h-14 px-5 bg-surface-card border-b border-border-default flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="md:hidden p-1.5 -ml-1 text-text-muted hover:bg-surface-subtle rounded-md"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <Avatar src={selectedContact.image} name={selectedContact.name} size="sm" online />
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm leading-tight">{selectedContact.name}</h3>
                                <p className="text-[11px] text-status-success font-medium">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {(followState[selectedContact.id] ?? !!selectedContact.isFollowing)
                                ? <span className="text-[10px] px-2 py-1 rounded bg-status-success-bg text-status-success font-semibold">Following</span>
                                : <button
                                    type="button"
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className="text-[10px] px-2 py-1 rounded bg-brand-primary text-white font-semibold disabled:opacity-60"
                                >
                                    {followLoading ? "..." : "Follow"}
                                </button>}
                            <button className="text-text-muted hover:text-brand-primary transition-colors"><MoreVertical size={17} /></button>
                        </div>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface-subtle/50">
                        {loadingMessages ? (
                            <div className="flex justify-center py-10"><Spinner size="md" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                                <div className="bg-surface-card p-3 rounded-full shadow-sm">
                                    <MessageSquare size={32} className="text-brand-primary" />
                                </div>
                                <p className="text-sm bg-surface-card px-4 py-2 rounded-md shadow-sm">
                                    Start of conversation with {selectedContact.name}.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = currentUserId ? msg.senderId === currentUserId : (msg.senderId === "me" || msg.senderId !== selectedContact.id);
                                return (
                                    <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm text-sm ${isMe
                                            ? "bg-brand-primary text-white rounded-tr-none"
                                            : "bg-surface-card text-text-primary border border-border-default rounded-tl-none"}`}>
                                            <p className={`leading-relaxed whitespace-pre-wrap break-words ${isMe ? "!text-white" : ""}`}>{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? "!text-white/80" : "text-text-muted"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                {isMe && <CheckCheck size={12} className="!text-white/80" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3.5 bg-surface-card border-t border-border-default">
                        {sendError && <p className="mb-2 text-xs text-status-error">{sendError}</p>}
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                            <button type="button" className="p-2.5 text-text-muted hover:text-brand-primary hover:bg-surface-subtle rounded-md transition-colors">
                                <Paperclip size={16} />
                            </button>
                            <div className="flex-1 bg-surface-subtle rounded-lg border border-transparent focus-within:border-brand-primary/40 focus-within:bg-surface-card focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all flex items-end">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 p-2.5 max-h-28 min-h-[42px] resize-none text-text-primary placeholder-text-muted text-sm"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                                    }}
                                />
                                <button type="button" className="p-2.5 text-text-muted hover:text-brand-primary transition-colors">
                                    <Smile size={16} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-2.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover disabled:opacity-50 disabled:courser-not-allowed shadow-button-primary transition-all active:scale-95"
                            >
                                {sending ? <Spinner size="sm" /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-surface-subtle/50 text-center p-8 border-l border-border-default">
                    <div className="w-20 h-20 bg-brand-primary-light rounded-full flex items-center justify-center mb-5">
                        <MessageSquare size={40} className="text-brand-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-text-primary mb-1.5">Private Messages</h2>
                    <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                        Select a contact to start a private and secure conversation.
                    </p>
                </div>
            )}
        </div>
    );
}
