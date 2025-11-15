import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, storeName, bio } = await request.json()

    // Validation
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (role === 'CURATOR' && !storeName) {
      return NextResponse.json(
        { error: 'Store name is required for curators' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: role as 'BUYER' | 'CURATOR',
        }
      })

      // If curator, create curator profile
      if (role === 'CURATOR') {
        await tx.curatorProfile.create({
          data: {
            userId: user.id,
            storeName,
            bio: bio || null,
            slug: storeName.toLowerCase().replace(/\s+/g, '-'),
          }
        })
      }

      return user
    })

    // Return success without password
    const { password: _, ...userWithoutPassword } = result

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 