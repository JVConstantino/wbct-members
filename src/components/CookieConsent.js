"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "wbct-cookie-consent-v1";

const defaultPrefs = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
};

export default function CookieConsent() {
    const [open, setOpen] = useState(false);
    const [customize, setCustomize] = useState(false);
    const [prefs, setPrefs] = useState(defaultPrefs);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) setOpen(true);
    }, []);

    const persist = async (nextPrefs, mode) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPrefs));
        setOpen(false);
        setCustomize(false);
        try {
            await fetch("/api/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...nextPrefs, mode }),
            });
        } catch {}
    };

    if (!open) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[120] p-3 md:p-4">
            <div className="max-w-5xl mx-auto bg-surface-card border border-border-default rounded-lg shadow-modal p-4">
                <p className="text-sm font-semibold text-text-primary">Cookie Preferences</p>
                <p className="text-xs text-text-secondary mt-1">
                    We use cookies for security and platform functionality. You can accept, reject, or customize data sharing.{" "}
                    <Link href="/politica-de-cookies" className="underline hover:text-brand-primary transition-colors">
                        Cookie Policy
                    </Link>
                </p>

                {customize && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Necessary</span>
                            <input type="checkbox" checked disabled />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Analytics</span>
                            <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Marketing</span>
                            <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Preferences</span>
                            <input type="checkbox" checked={prefs.preferences} onChange={(e) => setPrefs((p) => ({ ...p, preferences: e.target.checked }))} />
                        </label>
                    </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        onClick={() => persist({ ...defaultPrefs, analytics: true, marketing: true, preferences: true }, "accept_all")}
                        className="btn-primary text-xs"
                    >
                        Accept all
                    </button>
                    <button
                        onClick={() => persist(defaultPrefs, "reject_all")}
                        className="btn-secondary text-xs"
                    >
                        Reject
                    </button>
                    {!customize ? (
                        <button onClick={() => setCustomize(true)} className="btn-ghost text-xs">Customize</button>
                    ) : (
                        <button onClick={() => persist({ ...prefs, necessary: true }, "custom")} className="btn-ghost text-xs">Save preferences</button>
                    )}
                </div>
            </div>
        </div>
    );
}
