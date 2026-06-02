"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Search,
    Bookmark,
    X,
    ExternalLink,
    CheckCircle2
} from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    parseISO
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

function EventModal({ event, onClose, onFollow }) {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-strong/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface-card w-full max-w-xl rounded-lg shadow-modal overflow-hidden border border-border-default">
                {/* Barra de cor */}
                <div className="h-1.5 w-full" style={{ backgroundColor: event.color || "#2563eb" }} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 bg-surface-subtle text-text-muted rounded-md hover:bg-status-error-bg hover:text-status-error transition-all z-10"
                >
                    <X size={16} />
                </button>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-brand-primary-light text-brand-primary px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                Exclusive Event
                            </span>
                            <span className="flex items-center gap-1 text-text-muted text-xs">
                                <Clock size={12} className="text-brand-primary" />
                                {new Date(event.date).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })} at {new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-text-primary leading-tight">
                            {event.title}
                        </h2>
                    </div>

                    <div className="p-4 bg-surface-subtle rounded-md border border-border-subtle">
                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">About this Event</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {event.description || "This event is an exclusive opportunity for WBCT community members."}
                        </p>
                    </div>

                    {event.link && (
                        <div className="flex items-center gap-3 p-3 bg-brand-primary-light rounded-md border border-brand-primary/20">
                            <ExternalLink className="text-brand-primary shrink-0" size={16} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-0.5">Link de Acesso</p>
                                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-semibold hover:underline text-xs truncate block">
                                    {event.link}
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => onFollow(event.id)}
                            className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 text-sm font-semibold transition-all
                                ${event.isFollowing
                                    ? "bg-status-success-bg text-status-success border border-status-success/20"
                                    : "btn-primary"}`}
                        >
                            {event.isFollowing ? (
                                <><CheckCircle2 size={16} /> Attendance Confirmed</>
                            ) : (
                                <><Bookmark size={16} /> Quero Participar</>
                            )}
                        </button>
                        {event.link && (
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-brand-strong text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                Acessar Site
                            </a>
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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/events");
                const data = await res.json();
                if (data.success) setEvents(data.events);
            } catch (error) {
                console.error("Failed to load events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getEventsForDay = (day) => {
        return events.filter(e => isSameDay(parseISO(e.date), day));
    };

    const handleDayClick = (day) => {
        const dayEvents = getEventsForDay(day);
        if (dayEvents.length > 0) setSelectedEvent(dayEvents[0]);
    };

    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const renderCalendarCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        const rows = [];
        let days = [];

        allDays.forEach((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            days.push(
                <div
                    key={day.toString()}
                    className={`flex-1 border-r border-b border-border-subtle p-1.5 courser-pointer hover:bg-surface-subtle transition-colors overflow-hidden ${!isCurrentMonth ? "opacity-30" : ""}`}
                    onClick={() => handleDayClick(day)}
                >
                    <div className="mb-1">
                        <span className={`text-sm font-semibold inline-flex items-center justify-center w-6 h-6 ${isToday ? "bg-brand-primary text-white rounded-full" : "text-text-primary"}`}>
                            {format(day, "d")}
                        </span>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                className="text-[10px] px-1.5 py-0.5 rounded text-white truncate"
                                style={{ backgroundColor: event.color || "#2563eb" }}
                            >
                                {format(parseISO(event.date), "HH:mm")} — {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(
                    <div className="grid grid-cols-7 flex-1" key={`row-${i}`}>{days}</div>
                );
                days = [];
            }
        });

        return (
            <div className="h-full flex flex-col border-t border-l border-border-subtle">
                {rows}
            </div>
        );
    };

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleFollow = async (eventId) => {
        try {
            const res = await fetch(`/api/events/${eventId}/follow`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setEvents(events.map(e => e.id === eventId ? { ...e, isFollowing: data.following } : e));
                if (selectedEvent?.id === eventId) setSelectedEvent(prev => ({ ...prev, isFollowing: data.following }));
            } else {
                console.error("Failed to mark interest:", data.error);
            }
        } catch (error) {
            console.error("Failed to confirm participation:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] gap-3">
                <Spinner size="lg" />
                <p className="text-text-muted text-sm">Syncing medical calendar...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onFollow={handleFollow} />}

            <PageHeader
                title="Calendar"
                subtitle="Community events and meetings"
            />

            {/* Calendário */}
            <div className="bg-surface-card rounded-lg border border-border-default shadow-card h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
                {/* Cabeçalho do Calendário */}
                <div className="flex items-center justify-between p-4 border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-surface-subtle rounded-md transition-colors">
                            <ChevronLeft size={18} className="text-text-secondary" />
                        </button>
                        <h3 className="text-base font-bold text-text-primary min-w-[160px] text-center capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: enUS })}
                        </h3>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-surface-subtle rounded-md transition-colors">
                            <ChevronRight size={18} className="text-text-secondary" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover px-2.5 py-1 rounded border border-brand-primary/30 hover:bg-brand-primary-light transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 bg-surface-subtle border-b border-border-subtle">
                    {WEEKDAYS.map(d => (
                        <div key={d} className="py-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grade do Calendário */}
                <div className="flex-1 overflow-hidden">
                    {renderCalendarCells()}
                </div>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                    type="text"
                    placeholder="Search events..."
                    className="input !pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grade de Eventos */}
            {filteredEvents.length === 0 ? (
                <EmptyState
                    icon={CalendarIcon}
                    title="No events found"
                    description={searchTerm ? "Try searching with other terms." : "Community events will appear here soon."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEvents.map(event => (
                        <div
                            key={event.id}
                            className="bg-surface-card rounded-lg border border-border-default shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                        >
                            <div className="h-1 w-full" style={{ backgroundColor: event.color }} />

                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div
                                        className="w-12 h-12 rounded-md flex flex-col items-center justify-center text-white shrink-0 shadow-sm"
                                        style={{ backgroundColor: event.color }}
                                    >
                                        <span className="text-base font-bold leading-none">{new Date(event.date).getDate()}</span>
                                        <span className="text-[9px] font-bold uppercase opacity-90">
                                            {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                                        </span>
                                    </div>
                                    {event.isFollowing && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-status-success bg-status-success-bg px-2 py-1 rounded">
                                            <CheckCircle2 size={11} /> Confirmed
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                        {event.description || "Exclusive event for WBCT members."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                    <Clock size={11} />
                                    {new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => handleFollow(event.id)}
                                        className={`flex-1 py-2 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${event.isFollowing
                                            ? "bg-brand-primary text-white"
                                            : "bg-surface-subtle text-text-secondary hover:bg-brand-primary-light hover:text-brand-primary"}`}
                                    >
                                        <Bookmark size={12} className={event.isFollowing ? "fill-white" : ""} />
                                        {event.isFollowing ? "Participando" : "Participar"}
                                    </button>
                                    <button
                                        onClick={() => setSelectedEvent(event)}
                                        className="px-3 py-2 rounded text-xs font-semibold bg-brand-strong text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
                                    >
                                        Detalhes
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
