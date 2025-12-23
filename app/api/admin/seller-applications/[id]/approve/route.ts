import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendApprovalNotification } from '@/lib/mailer';
import { createSlug, generateUniqueSlug } from '@/lib/slug';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const correlationId = `approve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

    // Find the application
    const application = await prisma.sellerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Idempotency: If already APPROVED, return success (don't error)
    if (application.status === 'APPROVED') {
      console.log(`[SELLER_APPROVE][${correlationId}][IDEMPOTENT] Application already approved:`, {
        applicationId: id,
        userId: application.userId,
      });
      return NextResponse.json({
        ok: true,
        message: 'Application already approved',
        applicationId: id,
      });
    }

    // If REJECTED, don't allow re-approval
    if (application.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Cannot approve a rejected application' },
        { status: 400 }
      );
    }

    // Check if user already has curator profile
    const existingProfile = await prisma.curatorProfile.findUnique({
      where: { userId: application.userId },
    });

    if (existingProfile) {
      // User already has curator profile, just update application status
      await prisma.sellerApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      console.log(`[SELLER_APPROVE][${correlationId}] Application approved (profile already exists):`, {
        applicationId: id,
        userId: application.userId,
      });

      return NextResponse.json({ 
        ok: true, 
        message: 'Application approved (user already has curator profile)',
        applicationId: id,
      });
    }

    // Create curator profile and update user role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.sellerApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      // Update user role to CURATOR
      await tx.user.update({
        where: { id: application.userId },
        data: { role: 'CURATOR' },
      });

      // Generate store name from full name if needed
      const storeName = application.fullName || `Store ${application.user.email}`;
      
      // Check for existing slugs to ensure uniqueness
      const existingSlugs = await tx.curatorProfile.findMany({
        select: { slug: true },
      });
      const slugList = existingSlugs.map(p => p.slug);
      const baseSlug = createSlug(storeName);
      const slug = await generateUniqueSlug(baseSlug, slugList);

      // Create curator profile
      const curatorProfile = await tx.curatorProfile.create({
        data: {
          userId: application.userId,
          storeName,
          slug,
          bio: application.reason || null,
          isPublic: true,
          isEditorsPick: false,
        },
      });

      return { updatedApplication, curatorProfile };
    });

    // Send approval email to applicant
    try {
      await sendApprovalNotification({
        applicantEmail: application.user.email,
        applicantName: application.fullName,
      });
      console.log(`[SELLER_APPROVE][${correlationId}][EMAIL] Approval email sent to:`, application.user.email);
    } catch (emailError) {
      console.error(`[SELLER_APPROVE][${correlationId}][EMAIL_ERROR] Failed to send approval email:`, emailError);
      // Don't fail the request if email fails
    }

    console.log(`[SELLER_APPROVE][${correlationId}][SUCCESS] Application approved:`, {
      applicationId: id,
      userId: application.userId,
      curatorProfileId: result.curatorProfile.id,
    });

    return NextResponse.json({
      ok: true,
      message: 'Application approved successfully',
      applicationId: id,
      curatorProfileId: result.curatorProfile.id,
    });

  } catch (error) {
    console.error('[SELLER_APPROVE][ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
