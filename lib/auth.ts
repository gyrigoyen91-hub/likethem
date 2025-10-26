import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";

const prisma = new PrismaClient();

export type UserRole = 'BUYER' | 'CURATOR' | 'ADMIN';

export const authOptions: NextAuthOptions = {
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
  callbacks: {
    async jwt({ token, user, account }) {
      // If this is a sign in, fetch user data from database
      if (account && user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, email: true, role: true, fullName: true }
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.fullName = dbUser.fullName || undefined;
          }
        } catch (error) {
          console.error('Error fetching user from database:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }
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
export async function auth(request: Request) {
  return await getServerSession(authOptions);
}