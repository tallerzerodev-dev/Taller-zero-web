import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { isAdminEmail } from "./admin";

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
                session.user.isAdmin = isAdminEmail(session.user.email);
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Redireccionamos a la página de login si no hay sesión
    }
};