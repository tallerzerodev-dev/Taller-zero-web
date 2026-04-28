import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (user && user.email) {
                try {
                    await prisma.user.upsert({
                        where: { email: user.email },
                        update: {
                            name: user.name,
                            image: user.image,
                        },
                        create: {
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        }
                    });
                } catch (e) {
                    console.error("Error upserting user on signIn:", e);
                }
            }
            return true;
        },
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