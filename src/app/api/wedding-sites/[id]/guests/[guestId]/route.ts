import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, guestId: string }> }
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

    const guest = await prisma.guest.findFirst({
      where: {
        id: resolvedParams.guestId,
        weddingSiteId: resolvedParams.id
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    const data = await request.json()

    const updatedGuest = await prisma.guest.update({
      where: { id: resolvedParams.guestId },
      data: {
        name: data.name || guest.name,
        email: data.email !== undefined ? data.email : guest.email,
        phone: data.phone !== undefined ? data.phone : guest.phone,
        relationship: data.relationship || guest.relationship,
        plusOne: data.plusOne !== undefined ? data.plusOne : guest.plusOne,
        plusOneName: data.plusOneName !== undefined ? data.plusOneName : guest.plusOneName,
        dietaryRestrictions: data.dietaryRestrictions !== undefined ? data.dietaryRestrictions : guest.dietaryRestrictions
      }
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, guestId: string }> }
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

    const guest = await prisma.guest.findFirst({
      where: {
        id: resolvedParams.guestId,
        weddingSiteId: resolvedParams.id
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    await prisma.guest.delete({
      where: { id: resolvedParams.guestId }
    })

    return NextResponse.json({ message: 'Guest deleted successfully' })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}