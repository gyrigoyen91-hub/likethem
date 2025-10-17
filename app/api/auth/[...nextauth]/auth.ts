import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            curatorProfile: {
              select: {
                id: true,
                storeName: true,
                isPublic: true,
                isEditorsPick: true
              }
            }
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName || undefined,
          avatar: user.avatar || undefined,
          curatorProfileId: user.curatorProfile?.id,
          storeName: user.curatorProfile?.storeName,
          isPublic: user.curatorProfile?.isPublic,
          isEditorsPick: user.curatorProfile?.isEditorsPick
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }: {
      user: any;
      account?: { provider?: string } | null;
      profile?: unknown;
    }) {
      try {
        const provider = account?.provider ?? 'unknown';

        // SAFE casting for Google profile shape
        const googleProfile = (profile ?? {}) as { email_verified?: boolean };

        // Map Google's boolean to our Prisma Date | null
        const emailVerifiedAt: Date | null =
          googleProfile.email_verified === true ? new Date() : null;

        // Map NextAuth user fields to our Prisma columns safely
        const mappedFullName = (user as any)?.name ?? null
        const mappedAvatar = (user as any)?.image ?? null

        // Upsert user atomically (no race between find/create/update)
        await prisma.user.upsert({
          where: { email: user.email! },
          create: {
            email: user.email!,
            password: '', // Empty password for OAuth users
            fullName: mappedFullName,
            avatar: mappedAvatar,
            provider,
            emailVerified: emailVerifiedAt,
          },
          update: {
            // Only update if values are present; undefined fields won't overwrite existing data
            ...(mappedFullName !== null ? { fullName: mappedFullName } : {}),
            ...(mappedAvatar !== null ? { avatar: mappedAvatar } : {}),
            provider,
            ...(emailVerifiedAt ? { emailVerified: emailVerifiedAt } : {}),
          },
        });

        console.log('[auth] signIn ok', {
          provider,
          email: user.email,
          googleEmailVerified: googleProfile.email_verified ?? null,
        });

        // Never block sign-in here
        return true;
      } catch (err) {
        console.error('[auth] signIn error', err);
        // Do not block user auth flow
        return true;
      }
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.fullName = user.fullName
        token.avatar = user.avatar
        token.phone = user.phone
        token.curatorProfileId = user.curatorProfileId
        token.storeName = user.storeName
        token.isPublic = user.isPublic
        token.isEditorsPick = user.isEditorsPick
      }
      return token
    },
    async session({ session, token, user }: any) {
      try {
        // Prefer an email to resolve the DB identity
        const email =
          (user as any)?.email ??
          session?.user?.email ??
          (token as any)?.email ??
          null;

        let dbUser = null;
        if (email) {
          dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, fullName: true, avatar: true, email: true, provider: true, emailVerified: true, phone: true, role: true },
          });
        }

        // Compose session.user from DB when available
        session.user = {
          id: dbUser?.id                       // <-- DB UUID
              ?? (user as any)?.id
              ?? (token as any)?.sub
              ?? (session.user as any)?.id
              ?? null,
          name: dbUser?.fullName ?? session.user?.name ?? null,
          email: dbUser?.email ?? session.user?.email ?? null,
          image: dbUser?.avatar ?? session.user?.image ?? null,
          // Keep custom fields from token if available
          role: dbUser?.role ?? token?.role ?? 'BUYER',
          fullName: dbUser?.fullName ?? token?.fullName ?? null,
          avatar: dbUser?.avatar ?? token?.avatar ?? null,
          phone: dbUser?.phone ?? token?.phone ?? null,
          provider: dbUser?.provider ?? token?.provider ?? null,
          emailVerified: dbUser?.emailVerified ?? token?.emailVerified ?? null,
          curatorProfileId: token?.curatorProfileId ?? null,
          storeName: token?.storeName ?? null,
          isPublic: token?.isPublic ?? null,
          isEditorsPick: token?.isEditorsPick ?? null,
        } as any;

        console.log("[auth][session] resolved", {
          hasDBUser: !!dbUser,
          sessionUserId: (session.user as any)?.id,
          email: session.user?.email,
        });

        return session;
      } catch (err) {
        console.error("[auth][session] error", err);
        return session; // never block
      }
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} 