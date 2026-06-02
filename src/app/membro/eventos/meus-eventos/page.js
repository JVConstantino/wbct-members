"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MemberMyEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch("/api/events/me");
                const data = await res.json();
                if (data.success) setEvents(data.events || []);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <PageHeader title="My Events" subtitle="Events you are attending" />

            {events.length === 0 ? (
                <EmptyState
                    icon={<Calendar size={20} />}
                    title="No events yet"
                    description="When you click to attend in the calendar, events will appear here."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-surface-card rounded-lg border border-border-default shadow-card p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{event.title}</h3>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                    event.status === "CONFIRMED"
                                        ? "bg-status-success-bg text-status-success"
                                        : event.status === "REJECTED"
                                            ? "bg-status-error-bg text-status-error"
                                            : "bg-status-warning-bg text-status-warning"
                                }`}>
                                    {event.status === "CONFIRMED" ? "Confirmed" : event.status === "REJECTED" ? "Rejected" : "Pending"}
                                </span>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-2">{event.description || "No description"}</p>
                            <div className="text-xs text-text-muted flex items-center gap-1.5">
                                <Clock size={12} />
                                {new Date(event.date).toLocaleString("pt-BR")}
                            </div>
                            {event.link && (
                                <a href={event.link} target="_blank" rel="noreferrer" className="text-xs text-brand-primary font-semibold inline-flex items-center gap-1 hover:underline">
                                    <ExternalLink size={12} /> Open event link
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
