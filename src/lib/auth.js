import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createLoginActivity, getUserByEmail, updateLastActiveAt } from "@/lib/user-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email:    { label: "Email",    type: "email"    },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const user = await getUserByEmail(credentials.email);
                    if (!user || !user.password) return null;

                    if (user.status === "PENDING") {
                        throw new Error("PENDING");
                    }
                    if (user.status === "REJECTED") {
                        throw new Error("REJECTED");
                    }

                    const isValid = await bcrypt.compare(
                        String(credentials.password),
                        user.password
                    );
                    if (!isValid) return null;

                    // Registrar atividade de login (não bloqueia o auth se falhar)
                    try {
                        await createLoginActivity(user.id);
                        await updateLastActiveAt(user.id);
                    } catch { /* não bloqueia o login */ }

                    return {
                        id:    String(user.id),
                        name:  user.name,
                        email: user.email,
                        role:  user.role,
                    };
                } catch (err) {
                    // Propagar erros de status para o client via NextAuth
                    if (err.message === "PENDING" || err.message === "REJECTED") {
                        throw err;
                    }
                    console.error("Auth authorize error:", err);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id   = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.role) session.user.role = token.role;
            if (token?.sub)  session.user.id   = token.sub;
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error:  "/login",
    },
});
