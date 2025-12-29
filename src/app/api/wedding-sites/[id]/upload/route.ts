import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const weddingSite = await prisma.weddingSite.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!weddingSite) {
      return NextResponse.json(
        { error: 'Wedding site not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!['hero', 'gallery', 'couple'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const filename = `${resolvedParams.id}/${type}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'public',
    })

    const imageUrl = blob.url

    // Update database based on type
    if (type === 'hero') {
      await prisma.weddingSite.update({
        where: { id: resolvedParams.id },
        data: { heroImage: imageUrl }
      })
    } else if (type === 'couple') {
      await prisma.weddingSite.update({
        where: { id: resolvedParams.id },
        data: { couplePhoto: imageUrl }
      })
    } else {
      // Add to gallery images
      const currentImages = weddingSite.galleryImages || []
      await prisma.weddingSite.update({
        where: { id: resolvedParams.id },
        data: {
          galleryImages: [...currentImages, imageUrl]
        }
      })
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageUrl,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
