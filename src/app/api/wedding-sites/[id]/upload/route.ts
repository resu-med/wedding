import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', resolvedParams.id)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const extension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create public URL
    const imageUrl = `/uploads/${resolvedParams.id}/${filename}`

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