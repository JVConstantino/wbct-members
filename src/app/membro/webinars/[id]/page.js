"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    PlayCircle,
    CheckCircle2,
    Clock,
    ChevronRight,
    Search,
    Loader2,
    Video,
    BookOpen,
    ArrowLeft,
    FileText,
    Download,
    CheckSquare,
    Square,
    Play
} from "lucide-react";

export default function CoursePlayer() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markingProgress, setMarkingProgress] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Course Details
                const courseRes = await fetch("/api/courses");
                const courseData = await courseRes.json();
                const foundCourse = courseData.courses?.find(c => c.id === courseId);
                setCourse(foundCourse);

                // Fetch Lessons
                const lessonsRes = await fetch(`/api/courses/${courseId}/lessons`);
                const lessonsData = await lessonsRes.json();

                if (lessonsData.success) {
                    const lessonsWithProgress = await Promise.all(lessonsData.lessons.map(async (lesson) => {
                        const progRes = await fetch(`/api/lessons/${lesson.id}/progress`);
                        const progData = await progRes.json();
                        return { ...lesson, completed: progData.completed };
                    }));

                    setLessons(lessonsWithProgress);
                    if (lessonsWithProgress.length > 0) {
                        setCurrentLesson(lessonsWithProgress[0]);
                    }
                }
            } catch (error) {
                console.error("Error loading course data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    const handleMarkAsWatched = async (lessonId, currentStatus) => {
        setMarkingProgress(true);
        try {
            const res = await fetch(`/api/lessons/${lessonId}/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setLessons(prev => prev.map(l =>
                    l.id === lessonId ? { ...l, completed: data.completed } : l
                ));
                if (currentLesson.id === lessonId) {
                    setCurrentLesson(prev => ({ ...prev, completed: data.completed }));
                }
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        } finally {
            setMarkingProgress(false);
        }
    };

    const handleNextLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getYoutubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    };

    const calculateProgress = () => {
        if (lessons.length === 0) return 0;
        const completedCount = lessons.filter(l => l.completed).length;
        return Math.round((completedCount / lessons.length) * 100);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Preparando sua sala de aula...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course not found.</h2>
                <button onClick={() => router.push("/member/webinars")} className="btn-primary mt-4">Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-20">
            {/* Left Column: Player & Info */}
            <div className="flex-1 space-y-6">
                <button
                    onClick={() => router.push("/member/webinars")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Recordings
                </button>

                {currentLesson ? (
                    <>
                        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
                            {getYoutubeEmbedUrl(currentLesson.videoUrl) ? (
                                <iframe
                                    src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white p-10 text-center">
                                    <Video size={64} className="opacity-20 mb-4" />
                                    <p className="text-xl font-bold">Video unavailable or invalid format.</p>
                                    <a href={currentLesson.videoUrl} target="_blank" className="btn-primary mt-4">Ver link direto</a>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{currentLesson.title}</h1>
                                <p className="text-slate-500 font-medium">Lesson {currentLesson.order} • {course.title}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleMarkAsWatched(currentLesson.id, currentLesson.completed)}
                                    disabled={markingProgress}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-md font-bold transition-all ${currentLesson.completed
                                        ? "bg-green-100 text-green-700 border border-green-200"
                                        : "bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:-translate-y-1"
                                        }`}
                                >
                                    {markingProgress ? <Loader2 className="animate-spin" size={20} /> : (
                                        currentLesson.completed ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />
                                    )}
                                    {currentLesson.completed ? "Lesson Completed" : "Mark as Watched"}
                                </button>
                                {lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                                    <button
                                        onClick={handleNextLesson}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Next Lesson"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">About this lesson</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {currentLesson.description || "No additional description for this lesson."}
                            </p>
                        </div>

                        {/* Material de Apoio Section */}
                        {currentLesson.attachments?.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 border border-slate-200 dark:border-slate-700/50">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <FileText className="text-primary-600" />
                                    Materiais de Apoio
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentLesson.attachments.map((att) => (
                                        <a
                                            key={att.id}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-600/30 hover:shadow-lg transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                                {att.type === 'pdf' ? <FileText size={24} /> : <BookOpen size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate group-hover:text-primary-600 transition-colors">{att.title}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{att.type}</span>
                                            </div>
                                            <Download size={18} className="text-slate-300 group-hover:text-primary-600" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100">
                        <Video size={48} className="mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inicie sua jornada!</h2>
                        <p className="text-slate-500">Select a lesson in the sidebar to start watching.</p>
                    </div>
                )}
            </div>

            {/* Right Column: Playlist */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col sticky top-6">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">Content</h3>
                            <span className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                {calculateProgress()}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-600 transition-all duration-1000 ease-out"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 space-y-2">
                        {lessons.map((lesson, idx) => (
                            <button
                                key={lesson.id}
                                onClick={() => {
                                    setCurrentLesson(lesson);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${currentLesson?.id === lesson.id
                                    ? "bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-900/30"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <div className="relative">
                                    {lesson.completed ? (
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${currentLesson?.id === lesson.id
                                            ? "bg-primary-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            }`}>
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${currentLesson?.id === lesson.id ? "text-primary-600" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                        {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Play size={10} className={currentLesson?.id === lesson.id ? "text-primary-400" : "text-slate-400"} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lesson {lesson.order}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

