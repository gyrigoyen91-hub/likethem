import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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