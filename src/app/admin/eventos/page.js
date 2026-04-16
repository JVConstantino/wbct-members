"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    X,
    Loader2,
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
    addDays,
    eachDayOfInterval,
    parseISO
} from "date-fns";

export default function EventsManagement() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewingParticipants, setViewingParticipants] = useState(null);
    const [participantsList, setParticipantsList] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "19:00",
        color: "#3b82f6",
        link: ""
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const monthStr = format(currentMonth, "yyyy-MM");
            const res = await fetch(`/api/events?month=${monthStr}`);
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

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchParticipants = async (eventId) => {
        try {
            setLoadingParticipants(true);
            const res = await fetch(`/api/admin/events/${eventId}/participants`);
            const data = await res.json();
            if (data.success) {
                setParticipantsList(data.participants);
            }
        } catch (error) {
            console.error("Error loading participants:", error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day) => {
        setSelectedDate(day);
        setNewEvent({
            ...newEvent,
            date: format(day, "yyyy-MM-dd")
        });
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
                setNewEvent({
                    title: "",
                    description: "",
                    date: "",
                    time: "19:00",
                    color: "#3b82f6",
                    link: ""
                });
                fetchEvents();
            }
        } catch (error) {
            console.error("Error creating event:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm("Do you really want to delete this event?")) return;

        try {
            const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchEvents();
            }
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    // Renderizar Células do Calendário
    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        const totalWeeks = Math.ceil(allDays.length / 7);

        allDays.forEach((day, i) => {
            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));

            days.push(
                <div
                    key={day.toString()}
                    className={`flex-1 bg-surface-card border-r border-b border-border-subtle p-1.5 transition-all hover:bg-surface-subtle cursor-pointer overflow-hidden ${!isSameMonth(day, monthStart) ? "text-slate-300 dark:text-slate-600" : ""
                        }`}
                    onClick={() => handleDayClick(day)}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? "bg-primary-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : ""}`}>
                            {format(day, "d")}
                        </span>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                className="text-[10px] p-1 rounded-md text-white truncate shadow-sm group relative"
                                style={{ backgroundColor: event.color }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <div className="flex justify-between items-center gap-1">
                                    <span className="truncate">{format(parseISO(event.date), "HH:mm")} - {event.title}</span>
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingParticipants(event);
                                                fetchParticipants(event.id);
                                            }}
                                            className="hover:text-primary-100 transition-colors"
                                            title="View Participants"
                                        >
                                            <Users size={10} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteEvent(event.id);
                                            }}
                                            className="hover:text-red-200 transition-colors"
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
                    <div className="grid grid-cols-7 flex-1" key={day.toString()}>
                        {days}
                    </div>
                );
                days = [];
            }
        });

        return <div className="h-full flex flex-col border-t border-l border-slate-200 dark:border-slate-800">{rows}</div>;
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-text-primary">Events</h2>
                    <p className="text-slate-500 text-xs">Organize and publish events</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedDate(new Date());
                        setNewEvent({ ...newEvent, date: format(new Date(), "yyyy-MM-dd") });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primary/90 transition-colors"
                >
                    <Plus size={14} />
                    New Event
                </button>
            </div>

            <div className="card p-0 overflow-hidden flex-1 flex flex-col">
                {/* Header do Calendário */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-bold min-w-[150px] text-center capitalize">
                            {format(currentMonth, "MMMM yyyy")}
                        </h3>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="animate-spin text-primary-600" size={20} />}
                        <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                            Today
                        </button>
                    </div>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid do Calendário */}
                <div className="flex-1 h-full">
                    {renderCells()}
                </div>
            </div>

            {/* Modal de Novo Evento */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="text-primary-600" size={24} />
                                Create New Event
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Event Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Weekly Mentorship"
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={newEvent.date}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Time</label>
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
                                    <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                                    <textarea
                                        className="input min-h-[100px] py-3"
                                        placeholder="Event details..."
                                        value={newEvent.description}
                                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Calendar Color</label>
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"].map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    className={`w-8 h-8 rounded-md transition-all ${newEvent.color === c ? "ring-2 ring-offset-2 ring-primary-600 scale-110" : ""}`}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => setNewEvent({ ...newEvent, color: c })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Link (Zoom, Meet, etc)</label>
                                        <input
                                            type="url"
                                            className="input"
                                            placeholder="https://..."
                                            value={newEvent.link}
                                            onChange={e => setNewEvent({ ...newEvent, link: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="animate-spin" size={20} /> : "Publish Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Inscritos */}
            {viewingParticipants && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="text-primary-600" size={24} />
                                    Event Participants
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{viewingParticipants.title}</p>
                            </div>
                            <button onClick={() => setViewingParticipants(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[400px] overflow-y-auto">
                            {loadingParticipants ? (
                                <div className="flex flex-col items-center py-10">
                                    <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
                                    <p className="text-sm text-slate-500">Fetching participants...</p>
                                </div>
                            ) : participantsList.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <Users className="mx-auto text-slate-300 mb-2" size={40} />
                                    <p className="text-slate-500 font-medium">No participants yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {participantsList.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-black">
                                                    <Mail size={10} />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setViewingParticipants(null)}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                            >
                                Close List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
