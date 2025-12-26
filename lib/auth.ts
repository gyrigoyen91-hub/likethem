import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type UserRole = 'BUYER' | 'CURATOR' | 'ADMIN';

// Validate required environment variables
function validateEnvVars() {
  const required = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error("[NextAuth] Missing required environment variables:", missing);
    // In production, we should throw, but for now log to help debugging
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  return required;
}

const envVars = validateEnvVars();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: envVars.NEXTAUTH_SECRET,
  debug: !isProduction, // Only debug in development
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // show error page here so we can read ?error=...
  },
  providers: [
    GoogleProvider({
      clientId: envVars.GOOGLE_CLIENT_ID!,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET!,
      // IMPORTANT: Always show account chooser to prevent silent account switching
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      // DO NOT allow linking accounts by email - prevents silent account switching
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            curatorProfile: {
              select: {
                id: true,
                storeName: true,
                isPublic: true,
                isEditorsPick: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
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
          isEditorsPick: user.curatorProfile?.isEditorsPick,
        };
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${isSecure ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // Required for OAuth redirects
        path: '/',
        secure: isSecure, // Only secure in production with HTTPS
      },
    },
    callbackUrl: {
      name: `${isSecure ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
      },
    },
    csrfToken: {
      name: `${isSecure ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
      },
    },
    pkceCodeVerifier: {
      name: `${isSecure ? '__Secure-' : ''}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `${isSecure ? '__Secure-' : ''}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  logger: {
    error(code: string, ...message: any[]) { 
      console.error("[NextAuth][logger][error]", code, ...message); 
    },
    warn(code: string, ...message: any[]) { 
      console.warn("[NextAuth][logger][warn]", code, ...message); 
    },
    debug(code: string, ...message: any[]) { 
      console.log("[NextAuth][logger][debug]", code, ...message); 
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const correlationId = `signin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const provider = account?.provider ?? 'unknown';
        const email = user?.email;
        const profileEmail = (profile as any)?.email;

        console.log(`[NextAuth][signIn][${correlationId}]`, { 
          provider,
          email,
          profileEmail,
          userId: user?.id,
          providerAccountId: (account as any)?.providerAccountId,
        });

        // Simple validation: For Google OAuth, ensure email exists
        if (provider === 'google') {
          const emailToCheck = profileEmail || email;
          if (!emailToCheck) {
            console.error(`[NextAuth][signIn][${correlationId}][BLOCKED]`, {
              reason: 'NO_EMAIL_FROM_GOOGLE',
              provider,
            });
            return false;
          }
        }

        // Let PrismaAdapter handle user/account creation with standard NextAuth rules
        // No custom DB writes or account deletions here
        return true;
      } catch (error) {
        // Enhanced error logging
        const errorDetails = {
          correlationId,
          error: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          provider: account?.provider,
          email: user?.email,
          profileEmail: (profile as any)?.email,
          providerAccountId: (account as any)?.providerAccountId,
          userId: user?.id,
        };
        
        console.error(`[NextAuth][signIn][${correlationId}][ERROR]`, errorDetails);
        
        // Re-throw so NextAuth can handle it appropriately
        throw error;
      }
    },
    async jwt({ token, user, account, trigger }) {
      const correlationId = `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get reliable user ID (prefer token.sub, fallback to token.id or user.id)
      const userId = (token.sub ?? token.id ?? user?.id) as string | undefined;
      
      // Initial sign-in - set user data from provider
      if (user?.id) {
        token.sub = user.id;
        // Use profile email if available (from Google), otherwise fallback to user.email
        const profileEmail = (account as any)?.profileEmail || (user as any)?.email || user.email;
        token.email = profileEmail;
        token.name = user.name;
        token.picture = user.image;
        // Set initial role from user object if available
        if (user.role) {
          token.role = user.role;
        }
      }

      // CRITICAL: Sync email from Google profile if it differs from DB
      // This ensures user.email matches the Google account they selected
      // Must run in jwt callback because user.id is available after PrismaAdapter creates the user
      if (userId && account?.provider === 'google') {
        // Get profileEmail from account (stored in signIn callback) or from user/token
        const profileEmail = (account as any)?.profileEmail || user?.email || token.email;
        const normalizedProfileEmail = profileEmail?.toLowerCase().trim();
        
        if (normalizedProfileEmail) {
          try {
            const dbUserForEmailSync = await prisma.user.findUnique({
              where: { id: userId },
              select: {
                email: true,
              },
            });

            if (dbUserForEmailSync) {
              const normalizedDbEmail = dbUserForEmailSync.email?.toLowerCase().trim();
              
              if (normalizedProfileEmail !== normalizedDbEmail) {
                // Check if profileEmail is already used by another user
                const emailOwner = await prisma.user.findUnique({
                  where: { email: normalizedProfileEmail },
                  select: { id: true },
                });

                if (emailOwner && emailOwner.id !== userId) {
                  // Email already taken by another user - log warning but don't block
                  console.warn(`[NextAuth][jwt][${correlationId}][EMAIL_SYNC_BLOCKED]`, {
                    reason: 'PROFILE_EMAIL_ALREADY_TAKEN',
                    profileEmail: normalizedProfileEmail,
                    dbEmail: normalizedDbEmail,
                    userId: userId,
                    emailOwnerId: emailOwner.id,
                    message: 'Google profile email is already used by another user, cannot sync',
                  });
                } else {
                  // Safe to update - email is not used by another user
                  await prisma.user.update({
                    where: { id: userId },
                    data: { email: normalizedProfileEmail },
                  });

                  console.log(`[NextAuth][jwt][${correlationId}][EMAIL_SYNCED]`, {
                    reason: 'EMAIL_UPDATED_FROM_PROFILE',
                    oldEmail: normalizedDbEmail,
                    newEmail: normalizedProfileEmail,
                    userId: userId,
                  });
                }
              }
            }
          } catch (emailSyncError) {
            // Log error but don't block - email update is non-critical
            console.error(`[NextAuth][jwt][${correlationId}][EMAIL_SYNC_ERROR]`, {
              error: emailSyncError instanceof Error ? emailSyncError.message : String(emailSyncError),
              profileEmail: normalizedProfileEmail,
              userId: userId,
            });
          }
        }
      }

      // CRITICAL: Always refresh role and user data from DB if we have a user ID
      // This ensures role changes in DB are reflected immediately without requiring re-login
      // Do this on EVERY call, not just on update trigger
      if (userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              role: true,
              fullName: true,
              avatar: true,
              phone: true,
              curatorProfile: {
                select: {
                  id: true,
                  storeName: true,
                  isPublic: true,
                  isEditorsPick: true,
                },
              },
            },
          });

          if (dbUser) {
            // Always refresh role from DB to catch role changes
            // CRITICAL: Set role with fallback to ensure it's never null/undefined
            const previousRole = token.role;
            token.role = dbUser.role || 'BUYER'; // Fallback to BUYER if somehow null
            token.fullName = dbUser.fullName ?? undefined;
            token.avatar = dbUser.avatar ?? undefined;
            token.phone = dbUser.phone ?? undefined;
            token.curatorProfileId = dbUser.curatorProfile?.id ?? undefined;
            token.storeName = dbUser.curatorProfile?.storeName ?? undefined;
            token.isPublic = dbUser.curatorProfile?.isPublic ?? undefined;
            token.isEditorsPick = dbUser.curatorProfile?.isEditorsPick ?? undefined;

            // Log role changes for debugging
            if (previousRole && previousRole !== dbUser.role) {
              console.log(`[NextAuth][jwt][${correlationId}][ROLE_CHANGE]`, {
                userId: token.sub,
                previousRole,
                newRole: dbUser.role,
                trigger: trigger || 'auto-refresh',
              });
            }

            // Log when role is set (for debugging)
            if (!isProduction) {
              console.log(`[NextAuth][jwt][${correlationId}][ROLE_SET]`, {
                userId: token.sub,
                role: token.role,
                fromDB: true,
              });
            }
          } else {
            // User not found in DB - set default role and log warning
            if (!token.role) {
              token.role = 'BUYER'; // Default fallback
            }
            console.warn(`[NextAuth][jwt][${correlationId}][WARN] User not found in DB:`, {
              userId: token.sub,
              email: token.email,
              fallbackRole: token.role,
            });
          }
        } catch (error) {
          // On error, ensure role has a fallback value
          if (!token.role) {
            token.role = 'BUYER';
          }
          console.error(`[NextAuth][jwt][${correlationId}][ERROR] Failed to refresh user from DB:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: token.sub,
            fallbackRole: token.role,
          });
          // Don't throw - allow token to proceed with existing data
        }
      } else {
        // No user ID available - set default role
        if (!token.role) {
          token.role = 'BUYER';
        }
      }

      return token;
    },
    async session({ session, token }) {
      const correlationId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // CRITICAL: Always set user ID and role from token
      // The token.role is always set from DB in the JWT callback
      if (token?.sub) {
        (session.user as any).id = token.sub;
        // CRITICAL: Ensure role is always set from token (which comes from DB)
        // token.role should always be set (with fallback to 'BUYER' in JWT callback)
        (session.user as any).role = (token.role as 'ADMIN' | 'BUYER' | 'CURATOR') || 'BUYER';
        (session.user as any).fullName = token.fullName ?? null;
        (session.user as any).avatar = token.avatar ?? null;
        (session.user as any).phone = token.phone ?? null;
        (session.user as any).curatorProfileId = token.curatorProfileId ?? null;
        (session.user as any).storeName = token.storeName ?? null;
        (session.user as any).isPublic = token.isPublic ?? null;
        (session.user as any).isEditorsPick = token.isEditorsPick ?? null;

        // Debug logging (development only)
        if (!isProduction) {
          console.log(`[NextAuth][session][${correlationId}]`, {
            userId: token.sub,
            role: (session.user as any).role,
            tokenRole: token.role,
            roleSet: !!(session.user as any).role,
          });
        }
      } else {
        // No token.sub - this shouldn't happen but handle gracefully
        // Set default role if missing
        if (!(session.user as any).role) {
          (session.user as any).role = 'BUYER';
        }
        console.warn(`[NextAuth][session][${correlationId}][WARN] No token.sub found`, {
          hasToken: !!token,
          hasSession: !!session,
          fallbackRole: (session.user as any).role,
        });
      }
      
      return session as any;
    },
    async redirect({ url, baseUrl }) {
      const targetBase = envVars.NEXTAUTH_URL || baseUrl;
      
      console.log("[NextAuth][redirect]", { 
        url, 
        baseUrl, 
        NEXTAUTH_URL: envVars.NEXTAUTH_URL,
        targetBase,
      });
      
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