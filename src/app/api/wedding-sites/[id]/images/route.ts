import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
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

    const { imageUrl, type } = await request.json()

    if (!imageUrl || !type) {
      return NextResponse.json(
        { error: 'Missing imageUrl or type' },
        { status: 400 }
      )
    }

    if (!['hero', 'gallery'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      )
    }

    // Delete physical file
    try {
      const filename = imageUrl.split('/').pop()
      const filepath = join(process.cwd(), 'public', 'uploads', resolvedParams.id, filename)
      await unlink(filepath)
    } catch (fileError) {
      console.error('Error deleting file:', fileError)
      // Continue with database update even if file deletion fails
    }

    // Update database
    if (type === 'hero') {
      await prisma.weddingSite.update({
        where: { id: resolvedParams.id },
        data: { heroImage: null }
      })
    } else {
      // Remove from gallery images
      const currentImages = weddingSite.galleryImages || []
      const updatedImages = currentImages.filter(img => img !== imageUrl)
      await prisma.weddingSite.update({
        where: { id: resolvedParams.id },
        data: {
          galleryImages: updatedImages
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}