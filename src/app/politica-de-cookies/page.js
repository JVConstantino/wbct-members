"use client";

import Link from "next/link";

const STORAGE_KEY = "wbct-cookie-consent-v1";

function reopenBanner() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
}

export default function CookiePolicyPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-text-primary">
            <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold">Cookie Policy</h1>
                <p className="text-sm text-text-secondary">Last updated: June 6, 2026</p>
            </div>

            <section className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <p>
                    This Cookie Policy explains how International WBCT Society ("we", "us", or "our") uses cookies
                    and similar tracking technologies when you visit our platform. By using the Service, you
                    consent to the use of cookies as described in this policy.
                </p>
                <p>
                    You can manage your preferences at any time using the button below or by returning to the
                    cookie banner that appears on your first visit.
                </p>
                <button
                    onClick={reopenBanner}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-emerald-600 transition-colors"
                >
                    Manage Cookie Preferences
                </button>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">What Are Cookies?</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Cookies are small text files stored on your device when you visit a website. They allow the
                    site to remember your preferences and improve your experience. Cookies may be set by us
                    (first-party) or by third-party services we use.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Cookie Categories</h2>
                <p className="text-sm text-text-secondary">
                    We structure our cookies into four categories, in line with international best practices:
                </p>

                <div className="space-y-4">
                    {/* Necessary */}
                    <div className="p-4 rounded-lg border border-border-default bg-surface-subtle space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Necessary</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-status-success bg-status-success-bg px-2 py-0.5 rounded">
                                Always active
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Essential for the platform to function correctly. These cookies enable core features
                            such as authentication, session management, and security. They cannot be disabled.
                        </p>
                        <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                            <li>Session cookies for user authentication (NextAuth.js)</li>
                            <li>CSRF protection tokens</li>
                            <li>Cookie consent preference storage (localStorage)</li>
                        </ul>
                    </div>

                    {/* Analytics */}
                    <div className="p-4 rounded-lg border border-border-default bg-surface-subtle space-y-2">
                        <h3 className="font-semibold text-sm">Analytics</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Help us understand how members use the platform so we can improve it. Data collected
                            is aggregated and anonymised where possible.
                        </p>
                        <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                            <li>Page view and navigation tracking</li>
                            <li>Feature usage metrics (internal)</li>
                        </ul>
                    </div>

                    {/* Marketing */}
                    <div className="p-4 rounded-lg border border-border-default bg-surface-subtle space-y-2">
                        <h3 className="font-semibold text-sm">Marketing</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Used to deliver relevant communications and measure the effectiveness of our outreach.
                            Only active if you have provided explicit consent.
                        </p>
                        <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                            <li>Email campaign tracking (Resend)</li>
                            <li>Event and webinar promotion preferences</li>
                        </ul>
                    </div>

                    {/* Preferences */}
                    <div className="p-4 rounded-lg border border-border-default bg-surface-subtle space-y-2">
                        <h3 className="font-semibold text-sm">Preferences</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Remember your settings and personalisation choices to provide a consistent experience
                            across sessions.
                        </p>
                        <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                            <li>UI theme and display settings</li>
                            <li>Language and locale preferences</li>
                            <li>Notification preferences</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Consent Logging</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    When you make a choice in the cookie banner, we record your decision — including the
                    timestamp, your selected preferences, and (if logged in) your user identifier — to
                    maintain a verifiable consent audit trail, as required by applicable privacy regulations.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">How to Manage Cookies</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    You can change your cookie preferences at any time using the button at the top of this
                    page. Additionally, most browsers allow you to control cookies through their settings.
                    Please note that disabling certain cookies may affect platform functionality.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Data Processors</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We use the following third-party services that may process data via cookies or similar
                    technologies:
                </p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li><strong>Appwrite</strong> — database and authentication infrastructure</li>
                    <li><strong>Resend</strong> — transactional and newsletter email delivery</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Contact</h2>
                <p className="text-sm text-text-secondary">
                    For questions about this Cookie Policy or to exercise your data rights, please contact us at{" "}
                    <a href="mailto:info@wbctsociety.org" className="text-brand-primary hover:underline">
                        info@wbctsociety.org
                    </a>.
                </p>
                <p className="text-sm text-text-secondary">
                    See also our{" "}
                    <Link href="/politica-de-privacidade" className="text-brand-primary hover:underline">
                        Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/termos-de-uso" className="text-brand-primary hover:underline">
                        Terms of Use
                    </Link>.
                </p>
            </section>
        </main>
    );
}
