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
    error(code: string, meta?: any) { 
      console.error("[NextAuth][error]", code, meta); 
    },
    warn(code: string, meta?: any) { 
      console.warn("[NextAuth][warn]", code, meta); 
    },
    debug(code: string, meta?: any) { 
      if (!isProduction) {
        console.log("[NextAuth][debug]", code, meta); 
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const correlationId = `signin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const provider = account?.provider ?? 'unknown';
        const email = user?.email;
        const profileEmail = (profile as any)?.email;
        const providerAccountId = String((account as any)?.providerAccountId ?? '');

        console.log(`[NextAuth][signIn][${correlationId}]`, { 
          provider,
          email,
          profileEmail,
          providerAccountId,
          userId: user?.id,
          accountId: account?.providerAccountId,
        });

        // CRITICAL: Prevent providerAccountId collisions across different emails
        // Google may return the same providerAccountId for different emails
        // We must enforce email-based uniqueness and prevent silent account switching
        if (email && provider === 'google' && providerAccountId) {
          // Step 1: Check if email already exists in database
          const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              provider: true,
            },
          });

          // Step 2: Check if providerAccountId already exists in Account table
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: providerAccountId,
              },
            },
            select: {
              id: true,
              userId: true,
              providerAccountId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          });

          // Step 3: Decision logic
          if (existingUserByEmail) {
            // Email exists - check if it matches the account linked to providerAccountId
            if (existingAccount && existingAccount.userId !== existingUserByEmail.id) {
              // CRITICAL: providerAccountId is linked to a DIFFERENT user than the email
              // This means Google returned same providerAccountId for different email
              // BLOCK to prevent account collision
              console.error(`[NextAuth][signIn][${correlationId}][BLOCKED]`, {
                reason: 'PROVIDER_ACCOUNT_ID_COLLISION',
                email,
                profileEmail,
                providerAccountId,
                existingAccountUserId: existingAccount.userId,
                existingAccountUserEmail: existingAccount.user.email,
                existingUserByEmailId: existingUserByEmail.id,
                message: 'providerAccountId already linked to different user with different email',
              });
              return false; // OAuthAccountNotLinked
            }

            // Email exists and matches (or no account exists yet)
            if (existingUserByEmail.provider && existingUserByEmail.provider !== 'google') {
              // Email exists with a different provider - BLOCK sign-in
              console.error(`[NextAuth][signIn][${correlationId}][BLOCKED]`, {
                reason: 'EMAIL_EXISTS_DIFFERENT_PROVIDER',
                email,
                existingProvider: existingUserByEmail.provider,
                attemptedProvider: 'google',
                existingUserId: existingUserByEmail.id,
              });
              return false; // OAuthAccountNotLinked
            }

            // Email exists with same provider (or no provider) - allow sign-in
            console.log(`[NextAuth][signIn][${correlationId}][ALLOWED]`, {
              reason: 'EMAIL_EXISTS_SAME_PROVIDER',
              email,
              profileEmail,
              providerAccountId,
              provider: existingUserByEmail.provider || 'google',
              userId: existingUserByEmail.id,
            });
          } else {
            // Email does NOT exist - this is a new user
            if (existingAccount) {
              // CRITICAL: providerAccountId exists but email is different
              // This means Google returned same providerAccountId for different email
              // We MUST treat this as a NEW USER (different email = different identity)
              // But we need to prevent PrismaAdapter from linking to existing account
              // The solution: Delete the old account link so PrismaAdapter creates a new one
              console.warn(`[NextAuth][signIn][${correlationId}][WARN]`, {
                reason: 'PROVIDER_ACCOUNT_ID_EXISTS_DIFFERENT_EMAIL',
                email,
                profileEmail,
                providerAccountId,
                existingAccountUserId: existingAccount.userId,
                existingAccountUserEmail: existingAccount.user.email,
                action: 'Will delete old account link to allow new user creation',
              });

              // Delete the old account link to allow new user creation
              await prisma.account.delete({
                where: {
                  provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: providerAccountId,
                  },
                },
              });

              console.log(`[NextAuth][signIn][${correlationId}][ALLOWED]`, {
                reason: 'NEW_USER_DIFFERENT_EMAIL',
                email,
                profileEmail,
                providerAccountId,
                action: 'Deleted old account link, creating new user',
              });
            } else {
              // New user, no account exists - allow sign-in
              console.log(`[NextAuth][signIn][${correlationId}][ALLOWED]`, {
                reason: 'NEW_USER',
                email,
                profileEmail,
                providerAccountId,
                provider,
              });
            }
          }
        }


        // PrismaAdapter handles user/account creation
        // If PrismaAdapter fails, it will throw and NextAuth will handle it
        return true;
      } catch (error) {
        // Enhanced error logging for partner sign-in failures
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
        // NextAuth will redirect to /auth/signin?error=<errorCode>
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
        token.email = user.email;
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
      if (userId && account?.provider === 'google' && user?.id) {
        const profileEmail = (account as any)?.profileEmail || (user as any)?.email;
        const normalizedProfileEmail = profileEmail?.toLowerCase().trim();
        
        if (normalizedProfileEmail) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: {
                email: true,
              },
            });

            if (dbUser) {
              const normalizedDbEmail = dbUser.email?.toLowerCase().trim();
              
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
              email: true,
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