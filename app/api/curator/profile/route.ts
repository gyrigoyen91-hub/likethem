import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { generateSlugFromStoreName } from '@/lib/slug'

const prisma = new PrismaClient()

// GET /api/curator/profile - Get current user's curator profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      }
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ curatorProfile })
  } catch (error) {
    console.error('Error fetching curator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/curator/profile - Create a new curator profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { storeName, bio, instagram, tiktok, bannerImage } = await request.json()

    // Validation
    if (!storeName?.trim()) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    if (!bio?.trim()) {
      return NextResponse.json(
        { error: 'Bio is required' },
        { status: 400 }
      )
    }

    // Check if user already has a curator profile
    const existingProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already has a curator profile' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlugFromStoreName(storeName.trim())
    
    // Get all existing slugs to check for uniqueness
    const existingCurators = await prisma.curatorProfile.findMany({
      select: { slug: true }
    })
    const existingSlugs = existingCurators.map(c => c.slug).filter(Boolean)
    
    const uniqueSlug = await generateSlugFromStoreName(storeName.trim(), existingSlugs)

    // Create curator profile
    const curatorProfile = await prisma.curatorProfile.create({
      data: {
        userId: session.user.id,
        storeName: storeName.trim(),
        slug: uniqueSlug,
        bio: bio.trim(),
        instagram: instagram?.trim() || null,
        tiktok: tiktok?.trim() || null,
        bannerImage: bannerImage || null,
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      }
    })

    // Update user role to CURATOR
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'CURATOR' }
    })

    return NextResponse.json(
      { 
        message: 'Curator profile created successfully',
        curatorProfile 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating curator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 