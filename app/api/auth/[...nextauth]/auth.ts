import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
      const uid = (user?.id ?? token?.sub) as string | undefined
      session.user.id = uid
      session.user.email = (user?.email ?? token?.email ?? session.user.email) as string | undefined
      session.user.name = (user as any)?.fullName ?? (token as any)?.fullName ?? session.user.name
      session.user.image = (user as any)?.avatar ?? (token as any)?.avatar ?? session.user.image
      
      if (token) {
        session.user.role = token.role as string
        session.user.fullName = token.fullName as string
        session.user.avatar = token.avatar as string
        session.user.phone = token.phone as string
        session.user.curatorProfileId = token.curatorProfileId as string
        session.user.storeName = token.storeName as string
        session.user.isPublic = token.isPublic as boolean
        session.user.isEditorsPick = token.isEditorsPick as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} 