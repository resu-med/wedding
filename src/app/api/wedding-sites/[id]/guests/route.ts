import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const guests = await prisma.guest.findMany({
      where: {
        weddingSiteId: resolvedParams.id
      },
      include: {
        rsvps: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform guests to include RSVP status
    const guestsWithRSVP = guests.map(guest => ({
      ...guest,
      rsvpStatus: guest.rsvps.length > 0 ? guest.rsvps[0].status : 'PENDING'
    }))

    return NextResponse.json(guestsWithRSVP)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const data = await request.json()

    const guest = await prisma.guest.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        relationship: data.relationship,
        plusOne: data.plusOne || false,
        plusOneName: data.plusOneName || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        invitationSent: false,
        weddingSiteId: resolvedParams.id
      }
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}