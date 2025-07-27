import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.error('Upload API: No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Upload API: Session found for user:', session.user.id, 'Role:', session.user.role)

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing:', {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      })
      return NextResponse.json(
        { error: 'Image upload service not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file) => {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`)
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image.`)
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'likethem/products',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error)
              reject(error)
            } else {
              resolve({
                url: result?.secure_url,
                publicId: result?.public_id,
                altText: file.name
              })
            }
          }
        ).end(buffer)
      })
    })

    const uploadResults = await Promise.all(uploadPromises)

    return NextResponse.json({
      message: 'Images uploaded successfully',
      images: uploadResults
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    )
  }
} 