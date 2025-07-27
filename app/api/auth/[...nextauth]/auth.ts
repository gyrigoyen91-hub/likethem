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
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
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

          if (existingUser) {
            // Update user info if needed
            if (existingUser.fullName !== user.name || existingUser.avatar !== user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  fullName: user.name,
                  avatar: user.image
                }
              })
            }
            
            // Return user data for session
            user.id = existingUser.id
            user.role = existingUser.role
            user.fullName = existingUser.fullName || undefined
            user.avatar = existingUser.avatar || undefined
            user.curatorProfileId = existingUser.curatorProfile?.id
            user.storeName = existingUser.curatorProfile?.storeName
            user.isPublic = existingUser.curatorProfile?.isPublic
            user.isEditorsPick = existingUser.curatorProfile?.isEditorsPick
          } else {
            // Create new user
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                fullName: user.name,
                avatar: user.image,
                role: 'BUYER', // Default role for new users
                password: '', // Empty password for OAuth users
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
            
            user.id = newUser.id
            user.role = newUser.role
            user.fullName = newUser.fullName || undefined
            user.avatar = newUser.avatar || undefined
            user.curatorProfileId = newUser.curatorProfile?.id
            user.storeName = newUser.curatorProfile?.storeName
            user.isPublic = newUser.curatorProfile?.isPublic
            user.isEditorsPick = newUser.curatorProfile?.isEditorsPick
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
          return false
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