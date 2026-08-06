"use client";

import { useState } from "react";
import TextEditor from "@/components/TextEditor";
import { Save, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");

    const handlePublish = (e) => {
        e.preventDefault();
        console.log("Publishing:", { title, content, coverImage });
        alert("Post submitted for approval!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Post</h2>
                    <p className="text-slate-500">Create amazing content for the community.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon={<Save size={18} />}>
                        Draft
                    </Button>
                    <Button variant="primary" icon={<Send size={18} />} onClick={handlePublish}>
                        Publish
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card">
                    <label className="block text-sm font-semibold mb-2">Post Title</label>
                    <input
                        type="text"
                        className="input text-xl font-bold py-4"
                        placeholder="Give it a catchy title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="card">
                    <label className="block text-sm font-semibold mb-2">Featured Image</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Image URL (e.g. Unsplash)"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                        />
                        <div className="w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                            {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold">Content</label>
                    <TextEditor content={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
