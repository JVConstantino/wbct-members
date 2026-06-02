"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Trash2,
    Users,
    Mail
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
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";

export default function EventsManagement() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [viewingParticipants, setViewingParticipants] = useState(null);
    const [participantsList, setParticipantsList] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "19:00",
        color: "#2563eb",
        link: ""
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const monthStr = format(currentMonth, "yyyy-MM");
            const res = await fetch(`/api/events?month=${monthStr}`);
            const data = await res.json();
            if (data.success) setEvents(data.events);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchParticipants = async (eventId) => {
        try {
            setLoadingParticipants(true);
            const res = await fetch(`/api/admin/events/${eventId}/participants`);
            const data = await res.json();
            if (data.success) setParticipantsList(data.participants);
        } catch (error) {
            console.error("Failed to load participants:", error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const updateParticipantStatus = async (userId, status) => {
        if (!viewingParticipants?.id) return;
        try {
            const res = await fetch(`/api/admin/events/${viewingParticipants.id}/participants`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status })
            });
            const data = await res.json();
            if (data.success) {
                setParticipantsList((prev) => prev.map((p) => p.id === userId ? { ...p, status } : p));
            }
        } catch (error) {
            console.error("Failed to update participant status:", error);
        }
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day) => {
        setNewEvent({ ...newEvent, date: format(day, "yyyy-MM-dd") });
        setShowModal(true);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const eventDateTime = `${newEvent.date}T${newEvent.time}:00`;
            const payload = {
                title: newEvent.title,
                description: newEvent.description,
                date: eventDateTime,
                color: newEvent.color,
                link: newEvent.link
            };
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setNewEvent({ title: "", description: "", date: "", time: "19:00", color: "#2563eb", link: "" });
                fetchEvents();
            }
        } catch (error) {
            console.error("Failed to create event:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm("Do you really want to delete this event?")) return;
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchEvents();
        } catch (error) {
            console.error("Failed to delete evento:", error);
        }
    };

    const COLORS = ["#2563eb", "#ef4444", "#059669", "#d97706", "#8b5cf6"];
    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        const rows = [];
        let days = [];

        allDays.forEach((day, i) => {
            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
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
                                className="text-[10px] px-1.5 py-0.5 rounded text-white truncate group relative"
                                style={{ backgroundColor: event.color }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center gap-1">
                                    <span className="truncate">{format(parseISO(event.date), "HH:mm")} — {event.title}</span>
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={e => { e.stopPropagation(); setViewingParticipants(event); fetchParticipants(event.id); }}
                                            className="hover:text-white/70"
                                            title="Ver inscritos"
                                        >
                                            <Users size={10} />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                            className="hover:text-red-200"
                                            title="Delete"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
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

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <PageHeader
                title="Event Calendar"
                subtitle="Create and manage community events"
                actions={
                    <button
                        onClick={() => {
                            setNewEvent({ ...newEvent, date: format(new Date(), "yyyy-MM-dd") });
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-1.5 text-xs"
                    >
                        <Plus size={14} />
                        New Event
                    </button>
                }
            />

            <div className="bg-surface-card rounded-lg border border-border-default shadow-card flex-1 flex flex-col overflow-hidden">
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
                        {loading && <Spinner size="sm" />}
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
                    {renderCells()}
                </div>
            </div>

            {/* Modal: Criar Evento */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create New Event"
                size="md"
            >
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Event Title</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="E.g. Clinical Cardiology Webinar"
                            value={newEvent.title}
                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Data</label>
                            <input
                                type="date"
                                className="input"
                                value={newEvent.date}
                                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Time</label>
                            <input
                                type="time"
                                className="input"
                                value={newEvent.time}
                                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description (opcional)</label>
                        <textarea
                            className="input min-h-[80px]"
                            placeholder="Event details..."
                            value={newEvent.description}
                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Calendar Color</label>
                            <div className="flex gap-2 p-2 bg-surface-subtle rounded-md">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`w-7 h-7 rounded transition-transform ${newEvent.color === c ? "ring-2 ring-offset-1 ring-brand-primary scale-110" : ""}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setNewEvent({ ...newEvent, color: c })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Link (Zoom, Meet…)</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://..."
                                value={newEvent.link}
                                onChange={e => setNewEvent({ ...newEvent, link: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {creating ? <Spinner size="sm" /> : "Publish Event"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Inscritos */}
            <Modal
                isOpen={!!viewingParticipants}
                onClose={() => setViewingParticipants(null)}
                title="Event Participants"
                size="sm"
            >
                {viewingParticipants && (
                    <>
                        <p className="text-xs text-text-muted mb-4">{viewingParticipants.title}</p>

                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {loadingParticipants ? (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <Spinner size="md" />
                                    <p className="text-sm text-text-muted">Loading participants...</p>
                                </div>
                            ) : participantsList.length === 0 ? (
                                <div className="text-center py-8 bg-surface-subtle rounded-md">
                                    <Users className="mx-auto text-text-muted mb-2" size={32} />
                                    <p className="text-sm text-text-muted">No participants yet.</p>
                                </div>
                            ) : (
                                participantsList.map(user => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 bg-surface-subtle rounded-md">
                                        <Avatar src={user.image} name={user.name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                                <Mail size={10} />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            <div className="mt-1 text-[10px] font-semibold">
                                                <span className={`px-2 py-0.5 rounded ${
                                                    user.status === "CONFIRMED"
                                                        ? "bg-status-success-bg text-status-success"
                                                        : user.status === "REJECTED"
                                                            ? "bg-status-error-bg text-status-error"
                                                            : "bg-status-warning-bg text-status-warning"
                                                }`}>
                                                    {user.status === "CONFIRMED" ? "Confirmed" : user.status === "REJECTED" ? "Rejected" : "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => updateParticipantStatus(user.id, "CONFIRMED")}
                                                className="text-[10px] px-2 py-1 rounded bg-status-success-bg text-status-success hover:bg-status-success hover:text-white transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => updateParticipantStatus(user.id, "REJECTED")}
                                                className="text-[10px] px-2 py-1 rounded bg-status-error-bg text-status-error hover:bg-status-error hover:text-white transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setViewingParticipants(null)}
                                className="w-full btn-secondary"
                            >
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
