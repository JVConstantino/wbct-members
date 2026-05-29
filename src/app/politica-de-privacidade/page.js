export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-text-primary">
            <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
            <p className="text-sm text-text-secondary">Effective date: March 15, 2019</p>

            <section className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <p>International WBCT Society ("us", "we", or "our") operates the www.wbctsociety.org website (the "Service").</p>
                <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
                <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Information Collection and Use</h2>
                <p className="text-sm text-text-secondary">We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Cookies and Usage Data</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Tracking & Cookies Data</h2>
                <p className="text-sm text-text-secondary">We use cookies and similar tracking technologies to track activity and hold certain information. You can accept, refuse, or customize cookie categories at any time in our cookie preferences.</p>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>Session Cookies</li>
                    <li>Preference Cookies</li>
                    <li>Security Cookies</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Use of Data</h2>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>To provide and maintain the Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To allow participation in interactive features</li>
                    <li>To provide support and monitor usage</li>
                    <li>To detect, prevent and address technical issues</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Children's Privacy</h2>
                <p className="text-sm text-text-secondary">Our Service does not address anyone under the age of 18. We do not knowingly collect personal data from children.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Contact Us</h2>
                <p className="text-sm text-text-secondary">By email: info@wbctsociety.org</p>
                <p className="text-sm text-text-secondary">By visiting: https://www.wbctsociety.org/contact-us</p>
            </section>
        </main>
    );
}
