import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, formatRSVPEmail } from '@/lib/email'

interface GuestInput {
  name: string
  dietaryRequests?: string
  isMainGuest: boolean
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Handle both old single-guest format and new multi-guest format
    const guests: GuestInput[] = data.guests || [{
      name: data.name,
      dietaryRequests: data.dietaryRequests,
      isMainGuest: true
    }]

    // Validate required fields
    const mainGuest = guests.find(g => g.isMainGuest) || guests[0]
    if (!mainGuest?.name || !data.email || !data.rsvpStatus || !data.siteId) {
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

    // Generate a group ID for this RSVP submission
    const groupId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const createdGuests = []
    const createdRsvps = []

    // Create guests and RSVPs for each person in the party
    for (let i = 0; i < guests.length; i++) {
      const guestData = guests[i]
      const isMain = guestData.isMainGuest || i === 0

      // Check if this guest already exists (by email for main guest, or by name + site)
      let guest = null

      if (isMain) {
        // For main guest, check by email
        guest = await prisma.guest.findFirst({
          where: {
            email: data.email,
            weddingSiteId: data.siteId
          }
        })
      }

      if (!guest) {
        // Create new guest
        guest = await prisma.guest.create({
          data: {
            name: guestData.name,
            email: isMain ? data.email : null,
            phone: isMain ? (data.phone || null) : null,
            rsvpStatus: data.rsvpStatus,
            attendingCeremony: data.attendingCeremony,
            attendingReception: data.attendingReception,
            dietaryRequests: guestData.dietaryRequests || null,
            specialRequests: isMain ? (data.specialRequests || null) : null,
            isMainGuest: isMain,
            inviteGroup: groupId,
            weddingSiteId: data.siteId
          }
        })
      } else {
        // Update existing guest
        guest = await prisma.guest.update({
          where: { id: guest.id },
          data: {
            name: guestData.name,
            phone: data.phone || guest.phone,
            rsvpStatus: data.rsvpStatus,
            attendingCeremony: data.attendingCeremony,
            attendingReception: data.attendingReception,
            dietaryRequests: guestData.dietaryRequests || guest.dietaryRequests,
            specialRequests: data.specialRequests || guest.specialRequests,
            inviteGroup: groupId
          }
        })
      }

      createdGuests.push(guest)

      // Create RSVP record
      const rsvp = await prisma.rsvp.create({
        data: {
          status: data.rsvpStatus,
          attendingCeremony: data.attendingCeremony || false,
          attendingReception: data.attendingReception || false,
          dietaryRequests: guestData.dietaryRequests || null,
          specialRequests: isMain ? (data.specialRequests || null) : null,
          message: isMain ? (data.message || null) : null,
          guestId: guest.id,
          weddingSiteId: data.siteId
        }
      })

      createdRsvps.push(rsvp)
    }

    // Send email notification to partner1
    if (weddingSite.partner1Email) {
      const guestNames = guests.map(g => g.name).join(', ')
      const dietaryList = guests
        .filter(g => g.dietaryRequests)
        .map(g => `${g.name}: ${g.dietaryRequests}`)
        .join('\n')

      const emailHtml = formatRSVPEmail({
        guestName: guestNames,
        guestEmail: data.email,
        rsvpStatus: data.rsvpStatus,
        attendingCeremony: data.attendingCeremony || false,
        attendingReception: data.attendingReception || false,
        dietaryRequests: dietaryList || undefined,
        specialRequests: data.specialRequests,
        message: data.message,
        partner1Name: weddingSite.partner1Name,
        partner2Name: weddingSite.partner2Name,
        partySize: guests.length
      })

      const statusText = data.rsvpStatus === 'ATTENDING'
        ? 'attending'
        : data.rsvpStatus === 'NOT_ATTENDING'
        ? 'not attending'
        : 'undecided'

      // Send email in the background (don't block response)
      sendEmail({
        to: weddingSite.partner1Email,
        subject: `New RSVP: ${mainGuest.name}${guests.length > 1 ? ` + ${guests.length - 1} guest${guests.length > 2 ? 's' : ''}` : ''} ${statusText}`,
        html: emailHtml,
      }).catch(err => console.error('Failed to send RSVP email:', err))
    }

    return NextResponse.json({
      rsvps: createdRsvps,
      guests: createdGuests,
      groupId
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
