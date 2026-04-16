"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ArrowRight,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Search,
    Bookmark,
    X,
    ExternalLink,
    CheckCircle2
} from "lucide-react";

// Componente de Modal de Detalhes do Evento
function EventModal({ event, onClose, onFollow }) {
    if (!event) return null;

    const isFollowing = event.isFollowing;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-slate-100 dark:border-slate-800">
                {/* Faixa de Cor Superior */}
                <div className="h-4 w-full" style={{ backgroundColor: event.color || '#3b82f6' }}></div>

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12 space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary-100">
                                Evento Exclusive
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                                <Clock size={16} className="text-primary-500" />
                                {new Date(event.date).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })} às {new Date(event.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                            {event.title}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sobre este Evento</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
                                {event.description || "Este evento é uma oportunidade exclusiva para membros da elite WBCT compartilharem conhecimentos e networking de alto nível."}
                            </p>
                        </div>

                        {event.link && (
                            <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30">
                                <ExternalLink className="text-primary-600" size={20} />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest leading-none mb-1">Link de Acesso</p>
                                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold hover:underline break-all text-sm">
                                        {event.link}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => onFollow(event.id)}
                            className={`flex-1 py-5 rounded-lg flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all shadow-xl
                                ${isFollowing
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20"}`}
                        >
                            {isFollowing ? (
                                <><CheckCircle2 size={20} /> Presença Confirmada</>
                            ) : (
                                <><Bookmark size={20} /> Quero Participar</>
                            )}
                        </button>
                        {event.link && (
                            <Link
                                href={event.link}
                                target="_blank"
                                className="px-8 py-5 bg-slate-900 text-white rounded-lg font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                            >
                                Acessar Site
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MemberEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/events");
                const data = await res.json();
                if (data.success) {
                    setEvents(data.events);
                }
            } catch (error) {
                console.error("Error loading events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    }, [viewDate]);

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        if (!date) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const getEventsForDay = (date) => {
        if (!date) return [];
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
        });
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFollow = async (eventId) => {
        try {
            const res = await fetch(`/api/events/${eventId}/follow`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                const updatedEvents = events.map(e =>
                    e.id === eventId ? { ...e, isFollowing: data.following } : e
                );
                setEvents(updatedEvents);

                // Atualiza o estado do evento selecionado se ele for o que mudou
                if (selectedEvent && selectedEvent.id === eventId) {
                    setSelectedEvent({ ...selectedEvent, isFollowing: data.following });
                }
            }
        } catch (error) {
            console.error("Error following event:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Sincronizando agenda médica...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Modal de Detalhes */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onFollow={handleFollow}
                />
            )}

            {/* Split Header */}
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 p-10 lg:p-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 w-fit px-4 py-2 rounded-2xl">
                            <CalendarIcon size={20} />
                            <span className="text-xs font-black uppercase tracking-widest">Agenda Profissional</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Descubra sua próxima <span className="text-primary-600">Experiência</span></h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl">
                            Congressos, simpósios e encontros exclusivos. Mantenha sua agenda atualizada com o melhor da medicina.
                        </p>
                    </div>
                </div>

                {/* Calendário Dinâmico */}
                <div className="w-full xl:w-96 bg-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#3b82f6_0%,transparent_50%)] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-100 flex items-center gap-2">
                                <span className="capitalize">{viewDate.toLocaleString('pt-BR', { month: 'long' })}</span>
                                <span className="text-primary-400">{viewDate.getFullYear()}</span>
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-2 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-colors"><ChevronLeft size={16} /></button>
                                <button onClick={() => changeMonth(1)} className="p-2 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-500 mb-4 opacity-70">
                            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
                                const dayEvents = getEventsForDay(date);
                                const hasEvents = dayEvents.length > 0;
                                const active = isSelected(date);
                                const today = isToday(date);
                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            if (hasEvents) setSelectedEvent(dayEvents[0]);
                                        }}
                                        className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all
                                            ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/40 z-10 scale-110' :
                                                today ? 'bg-white/10 text-primary-400 border border-primary-500/30' :
                                                    'hover:bg-white/5 text-slate-400'}`}
                                    >
                                        {date.getDate()}
                                        {hasEvents && !active && (
                                            <div className="absolute bottom-1.5 flex gap-0.5">
                                                {dayEvents.slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color || '#3b82f6' }}></div>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* List and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar eventos..."
                        className="input pl-16 border-none bg-slate-50 dark:bg-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                    >
                        {/* Color Bar */}
                        <div className="h-1.5 w-full" style={{ backgroundColor: event.color }}></div>

                        <div className="p-6 space-y-4">
                            {/* Header: Date + Status */}
                            <div className="flex items-start justify-between">
                                <div
                                    className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shrink-0 shadow-sm"
                                    style={{ backgroundColor: event.color }}
                                >
                                    <span className="text-lg font-black leading-none">
                                        {new Date(event.date).getDate()}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase opacity-90">
                                        {new Date(event.date).toLocaleDateString("pt-BR", { month: "short" })}
                                    </span>
                                </div>
                                {event.isFollowing && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                        <CheckCircle2 size={12} /> Confirmado
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                    {event.description || "Evento exclusivo para membros."}
                                </p>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock size={14} />
                                <span>
                                    {new Date(event.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleFollow(event.id)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${event.isFollowing
                                        ? "bg-primary-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600"
                                        }`}
                                >
                                    <Bookmark size={14} className={event.isFollowing ? "fill-white" : ""} />
                                    {event.isFollowing ? "Participando" : "Participar"}
                                </button>
                                <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    Detalhes
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <CalendarIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No events found.</h3>
                        <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm">Experimente buscar por outros termos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
