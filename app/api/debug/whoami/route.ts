import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Prevent caching

// Debug endpoint to check current session role vs DB role
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    const session = await getServerSession({ ...authOptions });
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Not authenticated',
      }, { status: 401 });
    }

    // Get current DB user
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
    });

    // In production, only allow admins to access this endpoint
    if (isProduction) {
      if (!dbUser || dbUser.role !== 'ADMIN') {
        return NextResponse.json({ 
          error: 'Admin access required in production',
        }, { status: 403 });
      }
    }

    const response = {
      session: {
        userId: session.user.id,
        email: session.user.email,
        roleFromSession: (session.user as any).role || null,
      },
      db: {
        roleFromDb: dbUser?.role || null,
        userExists: !!dbUser,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        vercelEnv: process.env.VERCEL_ENV || null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
