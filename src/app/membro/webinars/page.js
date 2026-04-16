"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    PlayCircle,
    Clock,
    ChevronRight,
    Search,
    Loader2,
    Video,
    BookOpen,
    Layers
} from "lucide-react";

export default function MemberWebinars() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses");
                const data = await res.json();
                if (data.success) {
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error("Error loading courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Loading Learning Paths...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="relative p-4 lg:p-6 rounded-xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-600/10 dark:bg-primary-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-600/20 rounded-lg border border-primary-100 dark:border-primary-500/20">
                            <Layers className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">Academy Experience</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-3 leading-none text-slate-900 dark:text-white">Courses & Paths</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        Improve your technique and management with exclusive lesson sequences prepared for your evolution.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search by topic or course..."
                        className="input pl-12 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="text-slate-900 dark:text-white">{filteredCourses.length}</span> Available paths
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/membro/webinars/${course.id}`}
                        className="group bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
                    >
                        <div className="aspect-video bg-slate-900 relative overflow-hidden">
                            {course.image ? (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-800">
                                    <Video size={36} />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg">
                                    <PlayCircle size={24} className="text-white fill-white/10" />
                                </div>
                            </div>

                            <div className="absolute bottom-3 left-4 flex items-center gap-1 text-white/90">
                                <Clock size={12} className="text-primary-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{course.lessonCount || 0} Lessons</span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-base font-black mb-2 text-slate-900 dark:text-white leading-tight group-hover:text-primary-600 transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-slate-500 font-medium text-xs line-clamp-2 mb-3 leading-relaxed flex-1">
                                {course.description || "Inicie esta trilha de conhecimento e domine as melhores práticas do mercado."}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-primary-600 font-black text-[10px] uppercase tracking-wider">
                                    Enter Course <ChevronRight size={12} />
                                </div>
                                <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400 group-hover:text-primary-500 transition-colors">
                                    <BookOpen size={14} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Video className="mx-auto text-slate-300 mb-3" size={40} />
                        <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">No courses found for your search.</h3>
                        <p className="text-slate-400 dark:text-slate-500 mt-1">Try searching with different terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
