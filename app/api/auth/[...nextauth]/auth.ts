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
    async signIn({ user, account, profile }) {
      // Log sign-in attempt for debugging
      console.log('Sign-in attempt:', { 
        provider: account?.provider, 
        email: user.email, 
        emailVerified: profile?.email_verified 
      })
      
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const isGoogle = account?.provider === "google"

          const googleEmailVerified =
            isGoogle && (profile as Record<string, any>)?.email_verified === true

          const emailVerifiedAt: Date | null = googleEmailVerified ? new Date() : null

          const dbUser = await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              fullName: user.name,
              avatar: user.image,
              emailVerified: emailVerifiedAt,
            },
            create: {
              email: user.email!,
              fullName: user.name ?? null,
              avatar: user.image ?? null,
              role: 'BUYER', // Default role for new users
              password: '', // Empty password for OAuth users
              emailVerified: emailVerifiedAt,
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

          console.log("[auth] google email_verified:", (profile as Record<string, any>)?.email_verified)
          
          // Return user data for session
          user.id = dbUser.id
          user.role = dbUser.role
          user.fullName = dbUser.fullName || undefined
          user.avatar = dbUser.avatar || undefined
          user.curatorProfileId = dbUser.curatorProfile?.id
          user.storeName = dbUser.curatorProfile?.storeName
          user.isPublic = dbUser.curatorProfile?.isPublic
          user.isEditorsPick = dbUser.curatorProfile?.isEditorsPick
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
          // Don't block sign-in on errors, just log them
          // return false
        }
      }
      
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.fullName = user.fullName
        token.avatar = user.avatar
        token.curatorProfileId = user.curatorProfileId
        token.storeName = user.storeName
        token.isPublic = user.isPublic
        token.isEditorsPick = user.isEditorsPick
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.fullName = token.fullName as string
        session.user.avatar = token.avatar as string
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