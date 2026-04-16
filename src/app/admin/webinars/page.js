"use client";

import { useState, useEffect } from "react";
import {
    PlayCircle,
    Plus,
    Search,
    Loader2,
    Trash2,
    Edit,
    Video,
    ExternalLink,
    X,
    Save,
    ChevronLeft,
    FileText,
    Image as ImageIcon,
    File,
    Upload,
    CheckCircle2,
    ArrowUpDown
} from "lucide-react";

export default function CoursesManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    // States for Editing
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [courseForm, setCourseForm] = useState({
        title: "",
        description: "",
        image: ""
    });

    const [lessonForm, setLessonForm] = useState({
        title: "",
        description: "",
        videoUrl: "",
        order: 0,
        attachments: []
    });

    const [uploading, setUploading] = useState(false);
    const [uploadingCourse, setUploadingCourse] = useState(false);

    const fetchCourses = async () => {
        try {
            setLoading(true);
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

    const fetchLessons = async (courseId) => {
        try {
            setLoadingLessons(true);
            const res = await fetch(`/api/courses/${courseId}/lessons`);
            const data = await res.json();
            if (data.success) {
                setLessons(data.lessons);
            }
        } catch (error) {
            console.error("Error loading lessons:", error);
        } finally {
            setLoadingLessons(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Handlers for Courses
    const openCourseModal = (course = null) => {
        if (course) {
            setEditingCourseId(course.id);
            setCourseForm({
                title: course.title,
                description: course.description || "",
                image: course.image || ""
            });
        } else {
            setEditingCourseId(null);
            setCourseForm({
                title: "",
                description: "",
                image: ""
            });
        }
        setShowCourseModal(true);
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editingCourseId ? "PATCH" : "POST";
            const url = editingCourseId ? `/api/courses/${editingCourseId}` : "/api/courses";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseForm)
            });

            const data = await res.json();
            if (data.success) {
                setShowCourseModal(false);
                fetchCourses();
            } else {
                alert("Error saving course: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Connection error saving course");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm("Deleting this course will delete all linked lessons. Continue?")) return;
        try {
            const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchCourses();
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    // Handlers for Lessons
    const openLessonModal = (lesson = null) => {
        if (lesson) {
            setEditingLessonId(lesson.id);
            setLessonForm({
                title: lesson.title,
                description: lesson.description || "",
                videoUrl: lesson.videoUrl,
                order: lesson.order || 0,
                attachments: lesson.attachments || []
            });
        } else {
            setEditingLessonId(null);
            setLessonForm({
                title: "",
                description: "",
                videoUrl: "",
                order: lessons.length + 1,
                attachments: []
            });
        }
        setShowLessonModal(true);
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingLessonId) {
                const res = await fetch(`/api/lessons/${editingLessonId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(lessonForm)
                });
                const data = await res.json();
                if (data.success) {
                    setShowLessonModal(false);
                    fetchLessons(selectedCourse.id);
                } else {
                    alert("Error saving lesson: " + (data.error || "Unknown error"));
                }
            } else {
                const res = await fetch(`/api/courses/${selectedCourse.id}/lessons`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(lessonForm)
                });
                const data = await res.json();
                if (data.success) {
                    setShowLessonModal(false);
                    fetchLessons(selectedCourse.id);
                } else {
                    alert("Error saving lesson: " + (data.error || "Unknown error"));
                }
            }
        } catch (error) {
            console.error("Error saving lesson:", error);
            alert("Connection error saving lesson");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!confirm("Do you really want to delete this lesson?")) return;
        try {
            const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchLessons(selectedCourse.id);
            }
        } catch (error) {
            console.error("Error deleting lesson:", error);
        }
    };

    // Handle File Upload for Attachments
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                const type = file.type.includes("pdf") ? "pdf" : "image";
                setLessonForm({
                    ...lessonForm,
                    attachments: [
                        ...lessonForm.attachments,
                        { title: file.name, url: data.url, type }
                    ]
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
            e.target.value = ""; // Limpar input
        }
    };

    // Handle File Upload for Course Image
    const handleCourseImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCourse(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setCourseForm({ ...courseForm, image: data.url });
            }
        } catch (error) {
            console.error("Error uploading cover:", error);
        } finally {
            setUploadingCourse(false);
        }
    };

    const removeAttachment = (index) => {
        const newAttachments = [...lessonForm.attachments];
        newAttachments.splice(index, 1);
        setLessonForm({ ...lessonForm, attachments: newAttachments });
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Course List
    if (!selectedCourse) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-text-primary">Courses</h2>
                        <p className="text-slate-500 text-xs">Organize your lessons in sequences</p>
                    </div>
                    <button
                        onClick={() => openCourseModal()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primary/90 transition-colors"
                    >
                        <Plus size={14} />
                        New Course
                    </button>
                </div>

                <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-card border border-border-subtle rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                            <p className="text-slate-500 font-medium">Loading courses...</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                            <Video className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 font-medium text-lg">No courses registered</p>
                        </div>
                    ) : (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="bg-surface-card rounded-xl overflow-hidden border border-border-subtle flex flex-col hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-slate-900 relative group">
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-100 dark:bg-slate-800">
                                            <ImageIcon size={48} strokeWidth={1} />
                                            <span className="text-xs mt-2 uppercase tracking-widest font-bold opacity-50">No Cover</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => openCourseModal(course)}
                                            className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-slate-600 hover:text-primary-600 shadow-sm"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{course.title}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 flex-1 mb-3">
                                        {course.description || "No description."}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                                        <span className="text-[10px] font-bold text-text-muted uppercase">
                                            {course.lessonCount || 0} Lessons
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                fetchLessons(course.id);
                                            }}
                                            className="text-xs font-bold text-brand-primary hover:underline"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Course Modal */}
                {showCourseModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-xl font-bold">
                                    {editingCourseId ? "Edit Course" : "New Course"}
                                </h3>
                                <button onClick={() => setShowCourseModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Course Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={courseForm.title}
                                        onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea
                                        className="input min-h-[100px]"
                                        value={courseForm.description}
                                        onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 flex items-center justify-between">
                                        Course Cover
                                        <label className="cursor-pointer text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1">
                                            <Upload size={14} />
                                            {uploadingCourse ? "Uploading..." : "Upload Image"}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCourseImageUpload} disabled={uploadingCourse} />
                                        </label>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            value={courseForm.image}
                                            onChange={e => setCourseForm({ ...courseForm, image: e.target.value })}
                                            placeholder="Image URL (or use button above)"
                                        />
                                        {courseForm.image && (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={courseForm.image} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCourseModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 btn-primary py-2.5 rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Course"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Lesson List for Selected Course
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSelectedCourse(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold leading-tight">{selectedCourse.title}</h2>
                    <p className="text-slate-500 text-sm">Managing lessons for this course</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Course Lessons</h3>
                    <button
                        onClick={() => openLessonModal()}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={18} />
                        Add Lesson
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loadingLessons ? (
                        <div className="p-12 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
                            <p className="text-slate-500">Fetching lessons...</p>
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500">No lessons registered yet.</p>
                        </div>
                    ) : (
                        lessons.map((lesson, index) => (
                            <div key={lesson.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col md:flex-row md:items-center gap-4 group">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                        {lesson.order}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold truncate">{lesson.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Video size={12} /> {getYoutubeId(lesson.videoUrl) ? "YouTube Video" : "External Link"}
                                            </span>
                                            {lesson.attachments?.length > 0 && (
                                                <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                                                    <FileText size={12} /> {lesson.attachments.length} Materials
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openLessonModal(lesson)}
                                        className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        title="Edit Lesson"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="Delete Lesson"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold">
                                {editingLessonId ? "Edit Lesson" : "New Lesson"}
                            </h3>
                            <button onClick={() => setShowLessonModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleLessonSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium mb-1.5">Lesson Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={lessonForm.title}
                                        onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Order</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={lessonForm.order}
                                        onChange={e => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Video URL (YouTube)</label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        className="input pl-12"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={lessonForm.videoUrl}
                                        onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                        required
                                    />
                                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description/Content</label>
                                <textarea
                                    className="input min-h-[120px]"
                                    value={lessonForm.description}
                                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    placeholder="Instructions or lesson details..."
                                />
                            </div>

                            {/* Material de Apoio section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold flex items-center gap-2">
                                        <FileText size={18} className="text-primary-600" />
                                        Support Material (PDF or Image)
                                    </label>
                                    <label className="cursor-pointer text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg">
                                        <Upload size={14} />
                                        Upload Material
                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    {uploading && (
                                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300">
                                            <Loader2 className="animate-spin text-primary-600" size={18} />
                                            <span className="text-sm">Uploading file...</span>
                                        </div>
                                    )}

                                    {lessonForm.attachments.length === 0 && !uploading && (
                                        <p className="text-xs text-slate-400 italic">No material added.</p>
                                    )}

                                    {lessonForm.attachments.map((att, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 group/item">
                                            {att.type === 'pdf' ? <FileText className="text-red-500" size={20} /> : <ImageIcon className="text-blue-500" size={20} />}
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-full"
                                                    value={att.title}
                                                    onChange={(e) => {
                                                        const newAtts = [...lessonForm.attachments];
                                                        newAtts[idx].title = e.target.value;
                                                        setLessonForm({ ...lessonForm, attachments: newAtts });
                                                    }}
                                                />
                                                <p className="text-[10px] text-slate-400 truncate">{att.url}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                className="p-1.5 text-slate-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 bg-white dark:bg-slate-900 sticky bottom-0 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowLessonModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Lesson"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

