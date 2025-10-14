import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.rsvpStatus || !data.siteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the wedding site exists
    const weddingSite = await prisma.weddingSite.findUnique({
      where: { id: data.siteId }
    })

    if (!weddingSite) {
      return NextResponse.json(
        { error: 'Wedding site not found' },
        { status: 404 }
      )
    }

    if (!weddingSite.rsvpEnabled) {
      return NextResponse.json(
        { error: 'RSVP is not enabled for this wedding' },
        { status: 400 }
      )
    }

    // Check if RSVP deadline has passed
    if (weddingSite.rsvpDeadline && new Date() > weddingSite.rsvpDeadline) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 400 }
      )
    }

    // Create or find guest
    let guest = await prisma.guest.findFirst({
      where: {
        email: data.email,
        weddingSiteId: data.siteId
      }
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          rsvpStatus: data.rsvpStatus,
          attendingCeremony: data.attendingCeremony,
          attendingReception: data.attendingReception,
          dietaryRequests: data.dietaryRequests || null,
          specialRequests: data.specialRequests || null,
          plusOneName: data.plusOneName || null,
          weddingSiteId: data.siteId
        }
      })
    } else {
      // Update existing guest
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          name: data.name,
          phone: data.phone || guest.phone,
          rsvpStatus: data.rsvpStatus,
          attendingCeremony: data.attendingCeremony,
          attendingReception: data.attendingReception,
          dietaryRequests: data.dietaryRequests || guest.dietaryRequests,
          specialRequests: data.specialRequests || guest.specialRequests,
          plusOneName: data.plusOneName || guest.plusOneName
        }
      })
    }

    // Create RSVP record
    const rsvp = await prisma.rsvp.create({
      data: {
        status: data.rsvpStatus,
        attendingCeremony: data.attendingCeremony || false,
        attendingReception: data.attendingReception || false,
        dietaryRequests: data.dietaryRequests || null,
        specialRequests: data.specialRequests || null,
        plusOneName: data.plusOneName || null,
        plusOneEmail: data.plusOneEmail || null,
        message: data.message || null,
        guestId: guest.id,
        weddingSiteId: data.siteId
      }
    })

    return NextResponse.json({ rsvp, guest }, { status: 201 })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}