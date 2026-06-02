"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlayCircle, Clock, ChevronRight, Search, Video, BookOpen, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function WebinarsPage() {
    const [courses, setCourses]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res  = await fetch("/api/courses");
                const data = await res.json();
                if (data.success) setCourses(data.courses);
            } catch (err) {
                console.error("Failed to load courses:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Banner */}
            <div className="bg-surface-card border border-border-default shadow-card px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-brand-primary-light rounded-md">
                                <Layers size={14} className="text-brand-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Webinars</span>
                        </div>
                        <h2 className="text-xl font-display font-bold text-text-primary">Cursos e Webinars</h2>
                        <p className="text-sm text-text-secondary mt-0.5">
                            Improve your medical practice with exclusive content for healthcare professionals.
                        </p>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-text-muted">
                        <span className="text-brand-primary font-bold">{filtered.length}</span> course{filtered.length !== 1 ? "s" : ""} available{filtered.length !== 1 ? "is" : ""}
                    </div>
                </div>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                    type="text"
                    placeholder="Search by course or topic..."
                    className="input !pl-10"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Grid de courses */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-surface-card rounded-lg border border-border-default overflow-hidden">
                            <Skeleton variant="text" className="w-full aspect-video rounded-none" />
                            <div className="p-4 space-y-2">
                                <Skeleton variant="text" className="w-3/4 h-4" />
                                <Skeleton variant="text" className="w-full h-3" />
                                <Skeleton variant="text" className="w-full h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Video}
                    title="No courses found"
                    description={search ? "Try searching with other terms." : "Courses will appear here soon."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(course => (
                        <Link
                            key={course.id}
                            href={`/member/webinars/${course.id}`}
                            className="group bg-surface-card border border-border-default shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video bg-surface-section relative overflow-hidden border-b border-border-default">
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video size={28} className="text-text-muted" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 bg-black/45 border border-white/20 flex items-center justify-center">
                                        <PlayCircle size={20} className="text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-white/90">
                                    <Clock size={10} className="text-white/90" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">
                                        {course.lessonCount || 0} lesson{(course.lessonCount || 0) !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed flex-1">
                                    {course.description || "Start this learning path and master medical best practices."}
                                </p>
                                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                                    <span className="flex items-center gap-1 text-brand-primary text-[10px] font-semibold uppercase tracking-wide">
                                        Acessar course <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                    <div className="p-1.5 bg-surface-subtle text-text-muted group-hover:text-brand-primary transition-colors">
                                        <BookOpen size={13} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
