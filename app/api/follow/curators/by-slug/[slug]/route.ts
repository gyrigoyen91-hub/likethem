import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/follow/curators/by-slug/[slug] - Get follow status by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false })
    }

    const { slug } = await params

    // Resolve slug to curator ID
    const curator = await prisma.curatorProfile.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!curator) {
      return NextResponse.json({ isFollowing: false })
    }

    const follow = await (prisma as any).follow.findFirst({
      where: {
        userId: session.user.id,
        curatorId: curator.id,
      },
    })

    return NextResponse.json({ isFollowing: !!follow })
  } catch (error: any) {
    console.error('[api][follow-status] Error:', error)
    return NextResponse.json({ isFollowing: false })
  }
}

// POST /api/follow/curators/by-slug/[slug] - Follow by slug
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Resolve slug to curator ID
    const curator = await prisma.curatorProfile.findUnique({
      where: { slug },
      select: { id: true, isPublic: true },
    })

    if (!curator || !curator.isPublic) {
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    // Prevent following yourself
    const userCuratorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (userCuratorProfile?.id === curator.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Create follow
    try {
      await (prisma as any).follow.create({
        data: {
          userId: session.user.id,
          curatorId: curator.id,
        },
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json({ isFollowing: true })
      }
      throw error
    }

    return NextResponse.json({ isFollowing: true })
  } catch (error: any) {
    console.error('[api][follow] Error:', error)
    return NextResponse.json(
      { error: 'Failed to follow curator' },
      { status: 500 }
    )
  }
}

// DELETE /api/follow/curators/by-slug/[slug] - Unfollow by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Resolve slug to curator ID
    const curator = await prisma.curatorProfile.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!curator) {
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    await (prisma as any).follow.deleteMany({
      where: {
        userId: session.user.id,
        curatorId: curator.id,
      },
    })

    return NextResponse.json({ isFollowing: false })
  } catch (error: any) {
    console.error('[api][unfollow] Error:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow curator' },
      { status: 500 }
    )
  }
}
