"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2, Users, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { formatEventDateTime, utcToSaoPauloInputValue, saoPauloInputToUtcIso } from "@/lib/date-utils";

export default function EventsGerenciamentoPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [participantsTitle, setParticipantsTitle] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/events");
            const data = await res.json();
            if (data.success) setEvents(data.events || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const deleteOne = async (id) => {
        await fetch(`/api/events?id=${id}`, { method: "DELETE" });
        fetchEvents();
    };

    const deleteBulk = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Delete ${selectedIds.length} event(s)?`)) return;
        for (const id of selectedIds) {
            await fetch(`/api/events?id=${id}`, { method: "DELETE" });
        }
        setSelectedIds([]);
        fetchEvents();
    };

    const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const allSelected = events.length > 0 && events.every((e) => selectedIds.includes(e.id));
    const toggleAll = () => allSelected ? setSelectedIds([]) : setSelectedIds(events.map((e) => e.id));

    const openParticipants = async (event) => {
        setParticipantsTitle(event.title);
        setParticipants([]);
        setParticipantsOpen(true);
        const res = await fetch(`/api/admin/events/${event.id}/participants`);
        const data = await res.json();
        if (data.success) setParticipants(data.participants || []);
    };

    const openEdit = (event) => {
        setEditing({
            id: event.id,
            title: event.title || "",
            description: event.description || "",
            date: utcToSaoPauloInputValue(event.date),
            color: event.color || "#2563eb",
            link: event.link || "",
        });
        setEditOpen(true);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        const res = await fetch("/api/events", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...editing,
                date: editing.date ? saoPauloInputToUtcIso(editing.date) : null,
            })
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) {
            setEditOpen(false);
            setEditing(null);
            fetchEvents();
        }
    };

    return (
        <div className="space-y-5 min-w-0">
            <PageHeader title="Event Management" subtitle="View and remove registered events" />

            {selectedIds.length > 0 && (
                <div className="bg-status-warning-bg border border-status-warning/20 rounded-md p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-status-warning">{selectedIds.length} selected</span>
                    <button onClick={deleteBulk} className="btn-danger text-xs">Delete selected</button>
                </div>
            )}

            <div className="card p-0 overflow-hidden min-w-0">
                {loading ? (
                    <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
                ) : events.length === 0 ? (
                    <div className="p-8">
                        <EmptyState icon={<Calendar size={20} />} title="No events" description="Create events in Calendar." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <thead className="bg-surface-subtle border-b border-border-default">
                                <tr>
                                    <th className="px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-text-muted">Title</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-text-muted">Data</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-text-muted">Cor</th>
                                    <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(event.id)} onChange={() => toggleSelect(event.id)} /></td>
                                        <td className="px-4 py-3 text-sm font-medium text-text-primary">{event.title}</td>
                                        <td className="px-4 py-3 text-xs text-text-muted">{formatEventDateTime(event.date)}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-xs text-text-muted"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color || "#2563eb" }} />{event.color || "#2563eb"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openParticipants(event)} className="p-1.5 rounded-md text-text-muted hover:bg-surface-subtle" title="Ver participantes"><Users size={13} /></button>
                                                <button onClick={() => openEdit(event)} className="p-1.5 rounded-md text-brand-primary hover:bg-brand-primary-light" title="Edit event"><Pencil size={13} /></button>
                                                <button onClick={() => deleteOne(event.id)} className="p-1.5 rounded-md text-status-error hover:bg-status-error-bg" title="Delete event"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={participantsOpen} onClose={() => setParticipantsOpen(false)} title="Participantes" size="sm">
                <p className="text-xs text-text-muted mb-3">{participantsTitle}</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {participants.length === 0 ? (
                        <p className="text-xs text-text-muted">No confirmed/interested participants yet.</p>
                    ) : participants.map((p) => (
                        <div key={p.id} className="p-2.5 rounded border border-border-subtle bg-surface-subtle flex items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                                <p className="text-xs text-text-muted">{p.email}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                p.status === "CONFIRMED" ? "bg-status-success-bg text-status-success" : p.status === "REJECTED" ? "bg-status-error-bg text-status-error" : "bg-status-warning-bg text-status-warning"
                            }`}>
                                {p.status === "CONFIRMED" ? "Confirmed" : p.status === "REJECTED" ? "Rejected" : "Pending"}
                            </span>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit event" size="md">
                {editing && (
                    <form onSubmit={saveEdit} className="space-y-3">
                        <input className="input" value={editing.title} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Title" required />
                        <textarea className="input min-h-[80px]" value={editing.description} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="datetime-local" className="input" value={editing.date} onChange={(e) => setEditing((p) => ({ ...p, date: e.target.value }))} required />
                            <input type="color" className="input h-10 p-1" value={editing.color} onChange={(e) => setEditing((p) => ({ ...p, color: e.target.value }))} />
                        </div>
                        <input className="input" value={editing.link} onChange={(e) => setEditing((p) => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                        <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    </form>
                )}
            </Modal>
        </div>
    );
}
