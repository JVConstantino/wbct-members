import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "WBCT",
    description: "Technology education platform and knowledge hub.",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon.png", sizes: "32x32", type: "image/png" },
            { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "WBCT",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0ea5e9",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Providers>
                    {children}
                    <Footer />
                    <CookieConsent />
                </Providers>
            </body>
        </html>
    );
}
