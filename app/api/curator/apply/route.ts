import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { sendApplicationNotification } from '@/lib/mailer';
import { createDecisionUrls } from '@/lib/approval-token';

export async function POST(request: NextRequest) {
  try {
    // Detailed logging for debugging
    console.log('🔍 POST /api/curator/apply - Debug Info:');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Cookies:', request.headers.get('cookie'));
    
    // Check authentication using JWT token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log('JWT Token:', token);
    console.log('Token user ID:', token?.id);
    
    if (!token?.id) {
      console.log('❌ No token or user ID found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    console.log('✅ Token found, proceeding with application...');

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
      where: { userId: token.id as string },
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
      where: { userId: token.id as string },
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
        userId: token.id as string,
        fullName: fullName.trim(),
        socialLinks: socialLinks?.trim() || null,
        audienceBand: audienceBand?.trim() || null,
        reason: reason?.trim() || null,
        status: 'PENDING',
      },
    });

    // Generate decision URLs
    const { approveUrl, rejectUrl } = createDecisionUrls(application.id);

    // Send notification email to approver
    try {
      await sendApplicationNotification({
        applicantName: application.fullName,
        applicantEmail: token.email || '',
        socialLinks: application.socialLinks || undefined,
        audienceBand: application.audienceBand || undefined,
        reason: application.reason || undefined,
        approveUrl,
        rejectUrl,
      });
    } catch (emailError) {
      console.error('Failed to send application notification email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Log the application for debugging
    console.log('📝 Curator application submitted:', {
      applicationId: application.id,
      userId: token.id,
      applicantName: application.fullName,
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
