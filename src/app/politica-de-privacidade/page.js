import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-text-primary">
            <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
                <p className="text-sm text-text-secondary">Last updated: June 6, 2026</p>
            </div>

            <section className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <p>
                    International WBCT Society ("we", "us", or "our") is committed to protecting the personal
                    data of its members. This Privacy Policy describes how we collect, use, store, and protect
                    your information when you use the WBCT member platform (the "Service").
                </p>
                <p>
                    This policy is consistent with the Brazilian Lei Geral de Proteção de Dados (LGPD — Law
                    13.709/2018) and applicable international privacy standards.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. What Data We Collect</h2>
                <p className="text-sm text-text-secondary">We collect the following categories of personal data:</p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>Full name and professional email address</li>
                    <li>Password (stored as a one-way cryptographic hash — never in plain text)</li>
                    <li>Medical registration number and medical specialty</li>
                    <li>Professional biography and profile photo (optional)</li>
                    <li>Content you publish (posts, comments)</li>
                    <li>Social interactions (follows, connections, event participation)</li>
                    <li>Login timestamps and last active time</li>
                    <li>Cookie and consent preferences</li>
                    <li>IP address at the time of consent registration</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Legal Basis for Processing (LGPD Art. 7)</h2>
                <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-sm text-text-secondary">
                        <p><strong>Consent</strong> — Cookie preferences, marketing communications, newsletter subscription, and event communication opt-ins. You may withdraw consent at any time.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-sm text-text-secondary">
                        <p><strong>Contract execution</strong> — Account creation, membership management, and access to member-exclusive content.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-sm text-text-secondary">
                        <p><strong>Legitimate interest</strong> — Platform security, fraud prevention, system integrity, and service improvement analytics.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-sm text-text-secondary">
                        <p><strong>Legal obligation</strong> — Compliance with applicable laws and responding to lawful regulatory requests.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>To provide and maintain the member platform and its features</li>
                    <li>To manage your membership registration and approval</li>
                    <li>To send transactional notifications (account status, event updates)</li>
                    <li>To send newsletter and promotional communications (with your consent)</li>
                    <li>To enable community interactions (posts, messages, events)</li>
                    <li>To detect and prevent security threats and misuse</li>
                    <li>To comply with legal and regulatory requirements</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Data Retention</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We retain your personal data for as long as your account is active. If you delete your
                    account, your personal data (profile, posts, messages) is permanently erased from our
                    systems. Consent audit logs are retained for 5 years to meet legal traceability requirements.
                    Security and activity logs are retained for 12 months.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Data Processors</h2>
                <p className="text-sm text-text-secondary">
                    We share data with the following trusted processors who act on our instructions and are
                    bound by data protection agreements:
                </p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>
                        <strong>Appwrite</strong> (database.wbctmember.org) — database storage and authentication
                        infrastructure. Data is stored in our self-hosted Appwrite instance.
                    </li>
                    <li>
                        <strong>Resend</strong> — transactional and newsletter email delivery. Only your name and
                        email address are shared for this purpose.
                    </li>
                </ul>
                <p className="text-sm text-text-secondary">
                    We do not sell your personal data to third parties.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Cookies and Tracking</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We use cookies and similar technologies to operate the platform and, with your consent,
                    for analytics and marketing. You can manage your cookie preferences at any time. For full
                    details, see our{" "}
                    <Link href="/politica-de-cookies" className="text-brand-primary hover:underline">
                        Cookie Policy
                    </Link>.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Your Rights (LGPD Art. 18)</h2>
                <p className="text-sm text-text-secondary">Under the LGPD, you have the right to:</p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li><strong>Access</strong> — download a copy of all your personal data via your profile settings</li>
                    <li><strong>Rectification</strong> — update your profile information at any time</li>
                    <li><strong>Erasure</strong> — permanently delete your account and all associated data via profile settings</li>
                    <li><strong>Portability</strong> — export your data in JSON format</li>
                    <li><strong>Withdrawal of consent</strong> — update cookie or communication preferences at any time</li>
                    <li><strong>Information</strong> — request information about how your data is processed</li>
                </ul>
                <p className="text-sm text-text-secondary">
                    To exercise any of these rights, use the controls in your profile or contact us directly.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Security</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We implement appropriate technical and organisational measures to protect your data,
                    including password hashing (bcrypt), JWT-based session authentication, role-based access
                    control, and administrative action audit logging.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Data Breach Notification</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    In the event of a personal data breach that poses a risk to your rights and freedoms, we
                    will notify the relevant supervisory authority within 72 hours of becoming aware of it, and
                    will communicate the breach to affected individuals without undue delay, in accordance with
                    LGPD Art. 48.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Children's Privacy</h2>
                <p className="text-sm text-text-secondary">
                    Our Service is intended exclusively for licensed medical professionals. We do not knowingly
                    collect personal data from anyone under the age of 18.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">11. Changes to This Policy</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    We may update this Privacy Policy periodically. We will notify you of material changes by
                    posting the new policy on this page and updating the "Last updated" date. We encourage you
                    to review this page regularly.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">12. Contact</h2>
                <p className="text-sm text-text-secondary">
                    For questions, data subject requests, or to contact our Data Protection Officer (DPO):
                </p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>Email: <a href="mailto:info@wbctsociety.org" className="text-brand-primary hover:underline">info@wbctsociety.org</a></li>
                    <li>Website: <a href="https://www.wbctsociety.org/contact-us" className="text-brand-primary hover:underline">wbctsociety.org/contact-us</a></li>
                </ul>
            </section>
        </main>
    );
}
