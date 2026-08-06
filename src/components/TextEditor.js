"use client";

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Quote,
    Code,
    Minus,
    Eraser,
    Image as ImageIcon,
    Undo,
    Redo,
    Loader2
} from 'lucide-react';

const MenuBar = ({ editor }) => {
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Link URL', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
        }
        editor.chain().focus().setLink({ href: url }).run();
    };

    const triggerImageUpload = () => fileInputRef.current?.click();

    const handleImageFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploadingImage(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
            const data = await res.json();
            if (data.success) {
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                alert(data.error || 'Could not upload image.');
            }
        } catch {
            alert('Could not upload image.');
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 p-2 border-b border-border-default bg-surface-subtle rounded-t-xl">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('bold') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('italic') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('strike') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Strikethrough size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('heading', { level: 3 }) ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Heading3 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('bulletList') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('orderedList') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <ListOrdered size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('blockquote') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Quote size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('codeBlock') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <Code size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-2 rounded-md hover:bg-surface-card text-text-secondary"
                type="button"
            >
                <Minus size={18} />
            </button>
            <button
                onClick={setLink}
                className={`p-2 rounded-md hover:bg-surface-card ${editor.isActive('link') ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary'}`}
                type="button"
            >
                <LinkIcon size={18} />
            </button>
            <button
                onClick={triggerImageUpload}
                disabled={uploadingImage}
                className="p-2 rounded-md hover:bg-surface-card text-text-secondary disabled:opacity-50"
                type="button"
                title="Upload image"
            >
                {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
            />
            <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-2 rounded-md hover:bg-surface-card text-text-secondary"
                type="button"
            >
                <Eraser size={18} />
            </button>
            <div className="flex-1" />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded-md hover:bg-surface-card text-text-secondary"
                type="button"
            >
                <Undo size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded-md hover:bg-surface-card text-text-secondary"
                type="button"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};

export default function TextEditor({ initialContent, onChange }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false, autolink: true }),
            Image,
            Placeholder.configure({
                placeholder: 'Write the article content here...',
            }),
        ],
        content: initialContent || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none min-h-[320px] p-6 outline-none bg-surface-card rounded-b-xl transition-all border-t border-border-subtle text-text-primary',
            },
        },
        immediatelyRender: false,
    });

    if (!mounted) return (
        <div className="h-[350px] bg-surface-subtle animate-pulse rounded-2xl border border-border-default" />
    );

    if (!editor) return null;

    return (
        <div className="border border-border-default rounded-xl overflow-hidden shadow-inner bg-surface-card">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
}
