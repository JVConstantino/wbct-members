import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isMemberRoute = nextUrl.pathname.startsWith("/membro");
    const isAuthRoute = nextUrl.pathname === "/login";

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/membro", nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && (isAdminRoute || isMemberRoute)) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isAdminRoute && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/membro", nextUrl));
    }

    return null;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
