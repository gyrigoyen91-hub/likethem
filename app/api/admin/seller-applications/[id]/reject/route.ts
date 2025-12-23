import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRejectionNotification } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const correlationId = `reject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body for optional decision note
    const body = await request.json().catch(() => ({}));
    const { decisionNote } = body;

    // Find the application
    const application = await prisma.sellerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Idempotency: If already REJECTED, return success
    if (application.status === 'REJECTED') {
      console.log(`[SELLER_REJECT][${correlationId}][IDEMPOTENT] Application already rejected:`, {
        applicationId: id,
        userId: application.userId,
      });
      return NextResponse.json({
        ok: true,
        message: 'Application already rejected',
        applicationId: id,
      });
    }

    // If already APPROVED, don't allow rejection
    if (application.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot reject an approved application' },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.sellerApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        decisionNote: decisionNote || null,
      },
    });

    // Send rejection email to applicant
    try {
      await sendRejectionNotification({
        applicantEmail: application.user.email,
        applicantName: application.fullName,
        decisionNote: decisionNote || undefined,
      });
      console.log(`[SELLER_REJECT][${correlationId}][EMAIL] Rejection email sent to:`, application.user.email);
    } catch (emailError) {
      console.error(`[SELLER_REJECT][${correlationId}][EMAIL_ERROR] Failed to send rejection email:`, emailError);
      // Don't fail the request if email fails
    }

    console.log(`[SELLER_REJECT][${correlationId}][SUCCESS] Application rejected:`, {
      applicationId: id,
      userId: application.userId,
    });

    return NextResponse.json({
      ok: true,
      message: 'Application rejected successfully',
      applicationId: id,
    });

  } catch (error) {
    console.error('[SELLER_REJECT][ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
