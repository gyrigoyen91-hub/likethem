import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailTemplate {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactElement;
}

export async function sendMail({ to, subject, html, react }: EmailTemplate) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('📧 Email would be sent (dev mode):', { to, subject });
      return { success: true, id: 'dev-mode' };
    }

    const emailData: any = {
      from: 'LikeThem <noreply@likethem.io>',
      to,
      subject,
    };

    if (react) {
      emailData.react = react;
    } else if (html) {
      emailData.html = html;
    } else {
      throw new Error('Either html or react must be provided');
    }

    const result = await resend.emails.send(emailData);
    
    if (result.error) {
      console.error('Email sending failed:', result.error);
      throw new Error(`Email sending failed: ${result.error.message}`);
    }

    console.log('📧 Email sent successfully:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Helper function to send application notification to approver
export async function sendApplicationNotification({
  applicantName,
  applicantEmail,
  socialLinks,
  audienceBand,
  reason,
  approveUrl,
  rejectUrl,
}: {
  applicantName: string;
  applicantEmail: string;
  socialLinks?: string;
  audienceBand?: string;
  reason?: string;
  approveUrl: string;
  rejectUrl: string;
}) {
  const approverEmail = process.env.APP_APPROVER_EMAIL;
  if (!approverEmail) {
    throw new Error('APP_APPROVER_EMAIL not configured');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Curator Application</h2>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Applicant Details</h3>
        <p><strong>Name:</strong> ${applicantName}</p>
        <p><strong>Email:</strong> ${applicantEmail}</p>
        ${socialLinks ? `<p><strong>Social Links:</strong> ${socialLinks}</p>` : ''}
        ${audienceBand ? `<p><strong>Audience Size:</strong> ${audienceBand}</p>` : ''}
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveUrl}" 
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">
          ✅ Approve
        </a>
        <a href="${rejectUrl}" 
           style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          ❌ Reject
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This link will expire in 7 days. If you need to review the application again, 
        please contact the development team.
      </p>
    </div>
  `;

  return sendMail({
    to: approverEmail,
    subject: `New Curator Application – ${applicantName}`,
    html,
  });
}

// Helper function to send approval notification to applicant
export async function sendApprovalNotification({
  applicantEmail,
  applicantName,
}: {
  applicantEmail: string;
  applicantName: string;
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/curator`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 Congratulations!</h2>
      
      <p>Hi ${applicantName},</p>
      
      <p>Great news! Your curator application has been approved. You're now part of the LikeThem community!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" 
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Access Your Curator Dashboard
        </a>
      </div>

      <p>You can now:</p>
      <ul>
        <li>Upload and manage your products</li>
        <li>Track your sales and earnings</li>
        <li>Connect with other curators</li>
        <li>Access exclusive features</li>
      </ul>

      <p>Welcome to the team!</p>
      <p>The LikeThem Team</p>
    </div>
  `;

  return sendMail({
    to: applicantEmail,
    subject: "You're approved! Welcome to LikeThem",
    html,
  });
}

// Helper function to send rejection notification to applicant
export async function sendRejectionNotification({
  applicantEmail,
  applicantName,
  decisionNote,
}: {
  applicantEmail: string;
  applicantName: string;
  decisionNote?: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Application Update</h2>
      
      <p>Hi ${applicantName},</p>
      
      <p>Thank you for your interest in becoming a LikeThem curator. After careful review, we're unable to approve your application at this time.</p>
      
      ${decisionNote ? `
        <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>Feedback:</strong> ${decisionNote}
        </div>
      ` : ''}

      <p>We encourage you to:</p>
      <ul>
        <li>Continue building your audience and social presence</li>
        <li>Develop your unique style and brand</li>
        <li>Reapply in the future when you feel ready</li>
      </ul>

      <p>Thank you for your understanding.</p>
      <p>The LikeThem Team</p>
    </div>
  `;

  return sendMail({
    to: applicantEmail,
    subject: "Application Update - LikeThem",
    html,
  });
}
