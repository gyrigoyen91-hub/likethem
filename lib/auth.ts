import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";

const prisma = new PrismaClient();

export type UserRole = 'BUYER' | 'CURATOR' | 'ADMIN';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true, // TEMP: enable verbose logs for diagnosis
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Wire to Supabase users/password hash
        // For now, return null to disable credentials
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin", // our custom sign-in page
  },
  logger: {
    error(code, metadata) { console.error("[NextAuth][error]", code, metadata); },
    warn(code) { console.warn("[NextAuth][warn]", code); },
    debug(code, metadata) { console.log("[NextAuth][debug]", code, metadata); },
  },
  callbacks: {
    // Make signIn explicit — return true to allow
    async signIn({ user, account, profile }) {
      console.log("[NextAuth][signIn]", { hasUser: !!user, provider: account?.provider });
      return true;
    },
    // Ensure we propagate user.id (helps in JWT flow)
    async jwt({ token, user, account, profile }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token, user }) {
      if (token?.sub) (session.user as any).id = token.sub;
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session.user;
}

export function requireRole(user: any, role: string) {
  if (user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
}

// Helper for API routes to get session from request
export async function auth(request?: Request) {
  return await getServerSession(authOptions);
}