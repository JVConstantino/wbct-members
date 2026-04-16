"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Info, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling a cada 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fechar ao clicar fora
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        if (unreadCount > 0) {
            try {
                await fetch('/api/notifications', { method: 'PUT' });
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error('Error marking as read');
            }
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            markAllRead();
        }
        setIsOpen(!isOpen);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'MESSAGE': return <MessageSquare size={16} className="text-blue-500" />;
            case 'POST_APPROVED': return <CheckCircle size={16} className="text-green-500" />;
            case 'POST_REJECTED': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-slate-500" />;
        }
    };

    const getLink = (notif) => {
        switch (notif.type) {
            case 'MESSAGE': return `/membro/chat`; // Poderia ir direto pro chat específico se tivesse lógica no frontend
            case 'POST_APPROVED':
            case 'POST_REJECTED': return `/membro/minhas-postagens`;
            default: return '#';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                        <span className="text-xs text-slate-500">{unreadCount} new</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Bell className="mx-auto mb-2 opacity-20" size={32} />
                                No notifications received.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <Link
                                    key={notif.id}
                                    href={getLink(notif)}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                                                {notif.content}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(notif.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
