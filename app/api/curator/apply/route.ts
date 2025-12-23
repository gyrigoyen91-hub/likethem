import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendApplicationNotification } from '@/lib/mailer';
import { createDecisionUrls } from '@/lib/approval-token';

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Enhanced logging for debugging
    const correlationId = `apply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const host = request.headers.get('host');
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const cookieHeader = request.headers.get('cookie');
    
    console.log(`[CURATOR_APPLY][${correlationId}]`, {
      url: request.url,
      host,
      origin,
      referer,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasCookieHeader: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
    });
    
    // Check authentication using NextAuth session (more reliable than getToken)
    const session = await getServerSession(authOptions);
    
    console.log(`[CURATOR_APPLY][${correlationId}][SESSION]`, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id ? 'present' : 'missing',
      userEmail: session?.user?.email ? 'present' : 'missing',
    });
    
    if (!session?.user?.id) {
      console.log(`[CURATOR_APPLY][${correlationId}][ERROR] No session or user ID found`);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    console.log(`[CURATOR_APPLY][${correlationId}][SUCCESS] Session validated, userId: ${session.user.id}`);

    // Parse request body
    const body = await request.json();
    const { fullName, socialLinks, audienceBand, reason } = body;

    // Validate required fields
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Optional field validation
    if (socialLinks && typeof socialLinks !== 'string') {
      return NextResponse.json({ error: 'Social links must be a string' }, { status: 400 });
    }
    if (audienceBand && typeof audienceBand !== 'string') {
      return NextResponse.json({ error: 'Audience band must be a string' }, { status: 400 });
    }
    if (reason && typeof reason !== 'string') {
      return NextResponse.json({ error: 'Reason must be a string' }, { status: 400 });
    }

    // Rate limiting: Check if user has submitted an application in the last 10 minutes
    const existingApplication = await prisma.sellerApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (existingApplication.updatedAt > tenMinutesAgo) {
        return NextResponse.json(
          { error: 'Please wait 10 minutes before submitting another application' },
          { status: 429 }
        );
      }
    }

    // Upsert application (idempotent)
    const application = await prisma.sellerApplication.upsert({
      where: { userId: session.user.id },
      update: {
        fullName: fullName.trim(),
        socialLinks: socialLinks?.trim() || null,
        audienceBand: audienceBand?.trim() || null,
        reason: reason?.trim() || null,
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null,
        decisionNote: null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        fullName: fullName.trim(),
        socialLinks: socialLinks?.trim() || null,
        audienceBand: audienceBand?.trim() || null,
        reason: reason?.trim() || null,
        status: 'PENDING',
      },
    });

    // Generate admin review URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const adminReviewUrl = `${baseUrl}/admin/seller-applications`;

    // Send notification email to admin
    try {
      await sendApplicationNotification({
        applicantName: application.fullName,
        applicantEmail: session.user.email || '',
        socialLinks: application.socialLinks || undefined,
        audienceBand: application.audienceBand || undefined,
        reason: application.reason || undefined,
        applicationId: application.id,
        adminReviewUrl,
      });
    } catch (emailError) {
      console.error(`[CURATOR_APPLY][${correlationId}][EMAIL_ERROR] Failed to send notification:`, emailError);
      // Don't fail the request if email fails, but log it
    }

    // Log the application for debugging (data consistency verification)
    console.log(`[CURATOR_APPLY][${correlationId}][SUCCESS] Application submitted:`, {
      applicationId: application.id,
      userId: session.user.id,
      userEmail: session.user.email,
      applicantName: application.fullName,
      applicationUserId: application.userId,
      userIdsMatch: session.user.id === application.userId,
      status: application.status,
    });

    return NextResponse.json({ 
      ok: true, 
      applicationId: application.id,
      message: 'Application submitted successfully' 
    });

  } catch (error) {
    console.error('Error processing curator application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
