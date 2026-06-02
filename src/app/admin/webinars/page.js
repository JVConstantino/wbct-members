"use client";

import { useState, useEffect } from "react";
import {
    PlayCircle,
    Plus,
    Search,
    Trash2,
    Edit,
    Video,
    X,
    ChevronLeft,
    FileText,
    Image as ImageIcon,
    Upload,
    CheckCircle2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function CoursesManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingCourse, setUploadingCourse] = useState(false);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);

    const [courseForm, setCourseForm] = useState({ title: "", description: "", image: "" });
    const [lessonForm, setLessonForm] = useState({ title: "", description: "", videoUrl: "", order: 0, attachments: [] });

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/courses");
            const data = await res.json();
            if (data.success) setCourses(data.courses);
        } catch (error) {
            console.error("Failed to load courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async (courseId) => {
        try {
            setLoadingLessons(true);
            const res = await fetch(`/api/courses/${courseId}/lessons`);
            const data = await res.json();
            if (data.success) setLessons(data.lessons);
        } catch (error) {
            console.error("Failed to load lessons:", error);
        } finally {
            setLoadingLessons(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const openCourseModal = (course = null) => {
        if (course) {
            setEditingCourseId(course.id);
            setCourseForm({ title: course.title, description: course.description || "", image: course.image || "" });
        } else {
            setEditingCourseId(null);
            setCourseForm({ title: "", description: "", image: "" });
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
            }
        } catch (error) {
            console.error("Failed to save course:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm("Deleting this course will remove all linked lessons. Continue?")) return;
        try {
            const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchCourses();
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
    };

    const handleBulkDeleteCourses = async () => {
        if (!selectedCourseIds.length) return;
        if (!confirm(`Delete ${selectedCourseIds.length} course(s)? This will remove linked lessons.`)) return;
        for (const id of selectedCourseIds) {
            await fetch(`/api/courses/${id}`, { method: "DELETE" });
        }
        setSelectedCourseIds([]);
        fetchCourses();
    };

    const toggleSelectCourse = (id) => {
        setSelectedCourseIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const openLessonModal = (lesson = null) => {
        if (lesson) {
            setEditingLessonId(lesson.id);
            setLessonForm({ title: lesson.title, description: lesson.description || "", videoUrl: lesson.videoUrl, order: lesson.order || 0, attachments: lesson.attachments || [] });
        } else {
            setEditingLessonId(null);
            setLessonForm({ title: "", description: "", videoUrl: "", order: lessons.length + 1, attachments: [] });
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
                if (data.success) { setShowLessonModal(false); fetchLessons(selectedCourse.id); }
            } else {
                const res = await fetch(`/api/courses/${selectedCourse.id}/lessons`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(lessonForm)
                });
                const data = await res.json();
                if (data.success) { setShowLessonModal(false); fetchLessons(selectedCourse.id); }
            }
        } catch (error) {
            console.error("Failed to save lesson:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!confirm("Do you want to delete this lesson?")) return;
        try {
            const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchLessons(selectedCourse.id);
        } catch (error) {
            console.error("Failed to delete lesson:", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                const type = file.type.includes("pdf") ? "pdf" : "image";
                setLessonForm(prev => ({ ...prev, attachments: [...prev.attachments, { title: file.name, url: data.url, type }] }));
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleCourseImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingCourse(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) setCourseForm(prev => ({ ...prev, image: data.url }));
        } catch (error) {
            console.error("Cover upload error:", error);
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
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Vista: lista de courses
    if (!selectedCourse) {
        return (
            <div className="space-y-5">
                <PageHeader
                    title="Cursos e Webinars"
                    subtitle="Manage webinar content"
                    actions={
                        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => openCourseModal()}>
                            New Course
                        </Button>
                    }
                />

                {selectedCourseIds.length > 0 && (
                    <div className="bg-status-warning-bg border border-status-warning/20 rounded-md p-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-status-warning">{selectedCourseIds.length} course(s) selected</span>
                        <button onClick={handleBulkDeleteCourses} className="btn-danger text-xs">Delete selected</button>
                    </div>
                )}

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="input !pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <EmptyState
                        icon={Video}
                        title="No courses registered"
                        description="Crie o primeiro course de webinars."
                        action={<Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => openCourseModal()}>Create Course</Button>}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-surface-card rounded-lg border border-border-default shadow-card hover:shadow-card-hover transition-all flex flex-col overflow-hidden">
                                <div className="aspect-video bg-brand-strong relative group">
                                    <label className="absolute top-2 left-2 z-10 bg-surface-card/90 rounded p-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourseIds.includes(course.id)}
                                            onChange={() => toggleSelectCourse(course.id)}
                                        />
                                    </label>
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                                            <ImageIcon size={36} strokeWidth={1} />
                                            <span className="text-[10px] mt-1 uppercase tracking-widest font-bold opacity-40">Sem capa</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1.5">
                                        <button onClick={() => openCourseModal(course)} className="p-1.5 bg-surface-card/90 rounded text-text-secondary hover:text-brand-primary shadow-sm transition-colors">
                                            <Edit size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 bg-surface-card/90 rounded text-status-error hover:bg-status-error-bg shadow-sm transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <PlayCircle size={32} className="text-white/60" />
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-sm text-text-primary mb-1 line-clamp-1">{course.title}</h3>
                                    <p className="text-text-secondary text-xs line-clamp-2 flex-1 mb-3">
                                        {course.description || "No description."}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                                            {course.lessonCount || 0} lesson{(course.lessonCount || 0) !== 1 ? "s" : ""}
                                        </span>
                                        <button
                                            onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}
                                            className="text-xs font-semibold text-brand-primary hover:underline"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal: Curso */}
                <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title={editingCourseId ? "Edit Course" : "New Course"} size="md">
                    <form onSubmit={handleCourseSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Course Title</label>
                            <input type="text" className="input" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description</label>
                            <textarea className="input min-h-[80px]" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-text-secondary">Course Cover</label>
                                <label className="courser-pointer text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1">
                                    <Upload size={12} />
                                    {uploadingCourse ? "Uploading..." : "Upload"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleCourseImageUpload} disabled={uploadingCourse} />
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" className="input flex-1" value={courseForm.image} onChange={e => setCourseForm({ ...courseForm, image: e.target.value })} placeholder="Image URL (or use upload)" />
                                {courseForm.image && (
                                    <div className="w-12 h-12 rounded border border-border-subtle overflow-hidden">
                                        <img src={courseForm.image} className="w-full h-full object-cover" alt="Cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 btn-secondary">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Spinner size="sm" /> : "Save Course"}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        );
    }

    // View: lessons for the selected course
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-surface-subtle rounded-md text-text-secondary transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <PageHeader
                    title={selectedCourse.title}
                    subtitle="Managing lessons for this course"
                    actions={
                        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => openLessonModal()}>
                            New Lesson
                        </Button>
                    }
                />
            </div>

            <div className="bg-surface-card rounded-lg border border-border-default shadow-card overflow-hidden">
                <div className="divide-y divide-border-subtle">
                    {loadingLessons ? (
                        <div className="p-12 flex justify-center">
                            <Spinner size="lg" />
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="p-12 text-center">
                            <EmptyState
                                icon={Video}
                                title="No lessons registered"
                                description="Add the first lesson for this course."
                                action={<Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => openLessonModal()}>Add Lesson</Button>}
                            />
                        </div>
                    ) : (
                        lessons.map(lesson => (
                            <div key={lesson.id} className="p-4 hover:bg-surface-subtle flex flex-col md:flex-row md:items-center gap-3 group transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-9 h-9 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center font-bold text-sm text-text-muted">
                                        {lesson.order}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-text-primary truncate">{lesson.title}</h4>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[11px] text-text-muted flex items-center gap-1">
                                                <Video size={11} />
                                                {getYoutubeId(lesson.videoUrl) ? "YouTube" : "External link"}
                                            </span>
                                            {lesson.attachments?.length > 0 && (
                                                <span className="text-[11px] text-brand-primary font-medium flex items-center gap-1">
                                                    <FileText size={11} />
                                                    {lesson.attachments.length} material{lesson.attachments.length !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openLessonModal(lesson)} className="p-1.5 rounded text-text-secondary hover:text-brand-primary hover:bg-brand-primary-light transition-colors" title="Edit">
                                        <Edit size={15} />
                                    </button>
                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 rounded text-status-error hover:bg-status-error-bg transition-colors" title="Delete">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal: Lesson */}
            <Modal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} title={editingLessonId ? "Edit Lesson" : "New Lesson"} size="lg">
                <form onSubmit={handleLessonSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Lesson Title</label>
                            <input type="text" className="input" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Order</label>
                            <input type="number" className="input" value={lessonForm.order} onChange={e => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Video URL (YouTube)</label>
                        <div className="relative">
                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input type="url" className="input !pl-10" placeholder="https://www.youtube.com/watch?v=..." value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description / Content</label>
                        <textarea className="input min-h-[80px]" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Lesson details and instructions..." />
                    </div>

                    {/* Supporting material */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                                <FileText size={14} className="text-brand-primary" />
                                Supporting Material
                            </label>
                            <label className="courser-pointer text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 bg-brand-primary-light px-2 py-1 rounded transition-colors">
                                <Upload size={12} />
                                Upload File
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            {uploading && (
                                <div className="flex items-center gap-2 p-2.5 bg-surface-subtle rounded border border-dashed border-border-default">
                                    <Spinner size="sm" />
                                    <span className="text-xs text-text-secondary">Uploading file...</span>
                                </div>
                            )}
                            {lessonForm.attachments.length === 0 && !uploading && (
                                <p className="text-xs text-text-muted italic">No material added.</p>
                            )}
                            {lessonForm.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2.5 bg-surface-subtle rounded border border-border-subtle">
                                    {att.type === "pdf" ? <FileText className="text-status-error shrink-0" size={16} /> : <ImageIcon className="text-brand-primary shrink-0" size={16} />}
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            className="bg-transparent border-none p-0 text-xs font-medium focus:ring-0 w-full text-text-primary"
                                            value={att.title}
                                            onChange={e => {
                                                const newAtts = [...lessonForm.attachments];
                                                newAtts[idx].title = e.target.value;
                                                setLessonForm({ ...lessonForm, attachments: newAtts });
                                            }}
                                        />
                                        <p className="text-[10px] text-text-muted truncate">{att.url}</p>
                                    </div>
                                    <button type="button" onClick={() => removeAttachment(idx)} className="p-1 text-text-muted hover:text-status-error transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowLessonModal(false)} className="flex-1 btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving || uploading} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Spinner size="sm" /> : "Save Lesson"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
