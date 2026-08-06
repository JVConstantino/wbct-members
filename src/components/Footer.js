import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border-subtle bg-surface-card py-4 px-6 mt-auto">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-text-muted">
                <span>© {new Date().getFullYear()} WBCT Society</span>
                <Link href="/politica-de-privacidade" className="hover:text-brand-primary transition-colors">
                    Privacy Policy
                </Link>
                <Link href="/politica-de-cookies" className="hover:text-brand-primary transition-colors">
                    Cookie Policy
                </Link>
                <Link href="/termos-de-uso" className="hover:text-brand-primary transition-colors">
                    Terms of Use
                </Link>
            </div>
        </footer>
    );
}
