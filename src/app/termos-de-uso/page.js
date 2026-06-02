export default function TermsPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-text-primary">
            <h1 className="text-3xl font-display font-bold">Terms of Use</h1>
            <p className="text-sm text-text-secondary">This document defines the rules for using the WBCT platform for members and administrators.</p>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">1. Acceptance</h2>
                <p>By using the platform, you declare that you have read, understood, and accepted these terms and the Privacy Policy.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">2. Account and Security</h2>
                <p>The user is responsible for keeping their account and password confidential, as well as for all activity performed under their account.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">3. Conduct</h2>
                <p>Publishing illegal, offensive, misleading content or content that violates third-party rights is prohibited.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">4. Termination</h2>
                <p>WBCT may suspend or remove accounts in case of violation of these terms.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">5. Contact</h2>
                <p>Questions about these terms can be sent to info@wbctsociety.org.</p>
            </section>
        </main>
    );
}
