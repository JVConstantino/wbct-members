"use client";

import { useEffect, useState } from "react";
import { Mail, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function EmailConfigPage() {
    const [form, setForm] = useState({ resendApiKey: "", fromEmail: "", fromName: "WBCT" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch("/api/admin/settings/email");
                const data = await res.json();
                if (data.success) setForm(data.data);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const onSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        const res = await fetch("/api/admin/settings/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        setSaving(false);
        setMessage(data.success ? "Settings saved successfully." : (data.error || "Could not save."));
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Email Settings" subtitle="Configure Resend credentials for notifications" />

            <form onSubmit={onSave} className="card max-w-2xl space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Resend API Key</label>
                    <input
                        className="input"
                        type="password"
                        value={form.resendApiKey}
                        onChange={(e) => setForm((p) => ({ ...p, resendApiKey: e.target.value }))}
                        placeholder="re_..."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">From E-mail</label>
                        <input
                            className="input"
                            type="email"
                            value={form.fromEmail}
                            onChange={(e) => setForm((p) => ({ ...p, fromEmail: e.target.value }))}
                            placeholder="noreply@seudominio.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">From Name</label>
                        <input
                            className="input"
                            value={form.fromName}
                            onChange={(e) => setForm((p) => ({ ...p, fromName: e.target.value }))}
                            placeholder="WBCT"
                        />
                    </div>
                </div>

                {message && <p className="text-xs text-text-secondary">{message}</p>}

                <button disabled={saving || loading} className="btn-primary gap-2">
                    <Save size={14} /> {saving ? "Saving..." : "Save credenciais"}
                </button>
            </form>
        </div>
    );
}
