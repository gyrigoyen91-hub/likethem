import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, fullName: true },
    })

    // Always return success (don't reveal if email exists)
    // This prevents email enumeration attacks
    if (!user) {
      console.log('[AUTH][FORGOT_PASSWORD][EMAIL_NOT_FOUND]', { email })
      return NextResponse.json(
        { message: 'If that email exists, a password reset link has been sent' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in VerificationToken table (NextAuth pattern)
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: user.email,
          token: resetToken,
        },
      },
      create: {
        identifier: user.email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
      update: {
        token: resetToken,
        expires: resetTokenExpiry,
      },
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://likethem.io'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`

    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your LikeThem password',
        html: `
          <h2>Reset your password</h2>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      })

      console.log('[AUTH][FORGOT_PASSWORD][SUCCESS]', {
        userId: user.id,
        email: user.email,
      })
    } catch (emailError) {
      console.error('[AUTH][FORGOT_PASSWORD][EMAIL_ERROR]', {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        userId: user.id,
      })
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: 'If that email exists, a password reset link has been sent' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[AUTH][FORGOT_PASSWORD][ERROR]', {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
