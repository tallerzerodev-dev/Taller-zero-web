import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                // Marcamos si es admin comprobando correos preautorizados (en minúsculas)
                const allowedAdmins = (process.env.ADMIN_EMAILS || 'admin@tallerzero.com').split(',').map(e => e.trim().toLowerCase());
                const userEmail = session.user.email?.toLowerCase();

                session.user.isAdmin = userEmail ? allowedAdmins.includes(userEmail) : false;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Redireccionamos a la página de login si no hay sesión
    }
};