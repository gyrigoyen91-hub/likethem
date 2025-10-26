import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendApplicationNotification } from '@/lib/mailer';
import { createDecisionUrls } from '@/lib/approval-token';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // Generate decision URLs
    const { approveUrl, rejectUrl } = createDecisionUrls(application.id);

    // Send notification email to approver
    try {
      await sendApplicationNotification({
        applicantName: application.fullName,
        applicantEmail: session.user.email || '',
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
      userId: session.user.id,
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
