import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDecision } from '@/lib/approval-token';
import { sendApprovalNotification, sendRejectionNotification } from '@/lib/mailer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">Invalid Request</h2>
            <p>No decision token provided.</p>
            <a href="/" style="color: #10b981;">← Back to Home</a>
          </body>
        </html>
      `, { 
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Verify the decision token
    let decisionPayload;
    try {
      decisionPayload = verifyDecision(token);
    } catch (error) {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">Invalid Token</h2>
            <p>${error instanceof Error ? error.message : 'Token verification failed'}</p>
            <a href="/" style="color: #10b981;">← Back to Home</a>
          </body>
        </html>
      `, { 
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Load the application
    const application = await prisma.sellerApplication.findUnique({
      where: { id: decisionPayload.appId },
      include: { user: true },
    });

    if (!application) {
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">Application Not Found</h2>
            <p>The application could not be found.</p>
            <a href="/" style="color: #10b981;">← Back to Home</a>
          </body>
        </html>
      `, { 
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Check if already processed
    if (application.status !== 'PENDING') {
      const statusColor = application.status === 'APPROVED' ? '#10b981' : '#ef4444';
      const statusEmoji = application.status === 'APPROVED' ? '✅' : '❌';
      
      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: ${statusColor};">${statusEmoji} Already Processed</h2>
            <p>This application has already been ${application.status.toLowerCase()}.</p>
            <p><strong>Processed on:</strong> ${application.reviewedAt?.toLocaleDateString()}</p>
            ${application.decisionNote ? `<p><strong>Note:</strong> ${application.decisionNote}</p>` : ''}
            <a href="/" style="color: #10b981;">← Back to Home</a>
          </body>
        </html>
      `, { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const now = new Date();
    const reviewerEmail = 'email:approver'; // In a real app, you'd get this from the token or session

    if (decisionPayload.action === 'approve') {
      // Approve the application
      await prisma.$transaction(async (tx) => {
        // Update application status
        await tx.sellerApplication.update({
          where: { id: application.id },
          data: {
            status: 'APPROVED',
            reviewedBy: reviewerEmail,
            reviewedAt: now,
            decisionNote: 'Approved via email link',
          },
        });

        // Promote user to CURATOR role
        await tx.user.update({
          where: { id: application.userId },
          data: { role: 'CURATOR' },
        });

        // Ensure CuratorProfile exists
        const existingProfile = await tx.curatorProfile.findUnique({
          where: { userId: application.userId },
        });

        if (!existingProfile) {
          // Create a default curator profile
          const defaultHandle = application.fullName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          await tx.curatorProfile.create({
            data: {
              userId: application.userId,
              storeName: application.fullName,
              slug: defaultHandle,
              bio: 'Welcome to LikeThem!',
            },
          });
        }
      });

      // Send approval email to applicant
      try {
        await sendApprovalNotification({
          applicantEmail: application.user.email,
          applicantName: application.fullName,
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      // Log the approval
      console.log('✅ Curator application approved:', {
        applicationId: application.id,
        userId: application.userId,
        applicantName: application.fullName,
        reviewerEmail,
      });

      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #10b981;">✅ Application Approved</h2>
            <p><strong>${application.fullName}</strong> has been approved as a curator!</p>
            <p>They have been notified by email and can now access their curator dashboard.</p>
            <a href="/admin/curators/applications?done=approved" style="color: #10b981;">← View Applications</a>
          </body>
        </html>
      `, { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });

    } else if (decisionPayload.action === 'reject') {
      // Reject the application
      await prisma.sellerApplication.update({
        where: { id: application.id },
        data: {
          status: 'REJECTED',
          reviewedBy: reviewerEmail,
          reviewedAt: now,
          decisionNote: 'Rejected via email link',
        },
      });

      // Send rejection email to applicant
      try {
        await sendRejectionNotification({
          applicantEmail: application.user.email,
          applicantName: application.fullName,
          decisionNote: 'Thank you for your interest. Please continue building your audience and reapply in the future.',
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      // Log the rejection
      console.log('❌ Curator application rejected:', {
        applicationId: application.id,
        userId: application.userId,
        applicantName: application.fullName,
        reviewerEmail,
      });

      return new NextResponse(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">❌ Application Rejected</h2>
            <p><strong>${application.fullName}</strong>'s application has been rejected.</p>
            <p>They have been notified by email.</p>
            <a href="/admin/curators/applications?done=rejected" style="color: #10b981;">← View Applications</a>
          </body>
        </html>
      `, { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // This should never happen due to token validation, but just in case
    return new NextResponse(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Invalid Action</h2>
          <p>Invalid decision action.</p>
          <a href="/" style="color: #10b981;">← Back to Home</a>
        </body>
      </html>
    `, { 
      status: 400,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error processing curator decision:', error);
    return new NextResponse(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Server Error</h2>
          <p>An error occurred while processing the decision.</p>
          <a href="/" style="color: #10b981;">← Back to Home</a>
        </body>
      </html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
