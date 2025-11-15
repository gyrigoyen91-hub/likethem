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
  debug: true, // TEMP: enable verbose logs
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // show error page here so we can read ?error=...
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // TEMP: allow linking by email to unblock (explain in comment)
      // NOTE: enable temporarily to confirm the root cause; we'll replace with a safer flow later.
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
  logger: {
    error(code: string, meta?: any) { console.error("[NextAuth][error]", code, meta); },
    warn(code: string, meta?: any) { console.warn("[NextAuth][warn]", code, meta); },
    debug(code: string, meta?: any) { console.log("[NextAuth][debug]", code, meta); },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[NextAuth][signIn]", { provider: account?.provider, email: user?.email });
      // With allowDangerousEmailAccountLinking enabled, just return true
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth][redirect]", { url, baseUrl, NEXTAUTH_URL: process.env.NEXTAUTH_URL });
      
      // Use NEXTAUTH_URL if set, otherwise use baseUrl
      const targetBase = process.env.NEXTAUTH_URL || baseUrl;
      
      try {
        // Allow relative URLs - make them absolute
        if (url.startsWith("/")) {
          return `${targetBase}${url}`;
        }
        
        // Allow same-origin absolute URLs
        const urlObj = new URL(url);
        const baseObj = new URL(targetBase);
        if (urlObj.origin === baseObj.origin) {
          return url;
        }
      } catch (error) {
        // If URL parsing fails, fall back to baseUrl
        console.warn("[NextAuth][redirect] URL parsing error, using baseUrl:", error);
      }
      
      // Fallback to baseUrl
      return targetBase;
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