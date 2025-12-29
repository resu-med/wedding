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

    // Get all guests with their RSVPs
    const guests = await prisma.guest.findMany({
      where: {
        weddingSiteId: resolvedParams.id
      },
      include: {
        rsvps: {
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    })

    // Get recent RSVPs
    const recentRsvps = await prisma.rsvp.findMany({
      where: {
        weddingSiteId: resolvedParams.id
      },
      include: {
        guest: true
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    // Calculate stats
    const totalGuests = guests.length
    const attending = guests.filter(g => g.rsvpStatus === 'ATTENDING').length
    const notAttending = guests.filter(g => g.rsvpStatus === 'NOT_ATTENDING').length
    const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
    const maybe = guests.filter(g => g.rsvpStatus === 'MAYBE').length

    // Calculate ceremony vs reception attendance
    const attendingCeremony = guests.filter(g => g.attendingCeremony === true).length
    const attendingReception = guests.filter(g => g.attendingReception === true).length

    // Count plus ones
    const plusOnes = guests.filter(g => g.plusOneName && g.plusOneName.trim() !== '').length

    // Aggregate dietary requirements
    const dietaryMap: Record<string, string[]> = {}
    guests.forEach(guest => {
      if (guest.dietaryRequests && guest.dietaryRequests.trim() !== '') {
        const dietary = guest.dietaryRequests.trim().toLowerCase()
        if (!dietaryMap[dietary]) {
          dietaryMap[dietary] = []
        }
        dietaryMap[dietary].push(guest.name)
      }
    })

    // Convert dietary map to array sorted by count
    const dietaryRequirements = Object.entries(dietaryMap)
      .map(([requirement, guestNames]) => ({
        requirement: requirement.charAt(0).toUpperCase() + requirement.slice(1),
        count: guestNames.length,
        guests: guestNames
      }))
      .sort((a, b) => b.count - a.count)

    // Aggregate special requests
    const specialRequestsList = guests
      .filter(g => g.specialRequests && g.specialRequests.trim() !== '')
      .map(g => ({
        guestName: g.name,
        request: g.specialRequests!
      }))

    // Category breakdown
    const categoryMap: Record<string, { total: number; attending: number }> = {}
    guests.forEach(guest => {
      const category = guest.category || 'Uncategorized'
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, attending: 0 }
      }
      categoryMap[category].total++
      if (guest.rsvpStatus === 'ATTENDING') {
        categoryMap[category].attending++
      }
    })

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, stats]) => ({
        category,
        total: stats.total,
        attending: stats.attending
      }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      summary: {
        totalGuests,
        attending,
        notAttending,
        pending,
        maybe,
        responseRate: totalGuests > 0 ? Math.round(((attending + notAttending) / totalGuests) * 100) : 0,
        plusOnes,
        totalAttending: attending + plusOnes
      },
      eventBreakdown: {
        ceremony: attendingCeremony,
        reception: attendingReception
      },
      dietaryRequirements,
      specialRequests: specialRequestsList,
      categoryBreakdown,
      recentRsvps: recentRsvps.map(rsvp => ({
        id: rsvp.id,
        guestName: rsvp.guest.name,
        guestEmail: rsvp.guest.email,
        status: rsvp.status,
        attendingCeremony: rsvp.attendingCeremony,
        attendingReception: rsvp.attendingReception,
        message: rsvp.message,
        submittedAt: rsvp.submittedAt
      })),
      guests: guests.map(g => ({
        id: g.id,
        name: g.name,
        email: g.email,
        phone: g.phone,
        category: g.category,
        rsvpStatus: g.rsvpStatus,
        attendingCeremony: g.attendingCeremony,
        attendingReception: g.attendingReception,
        dietaryRequests: g.dietaryRequests,
        specialRequests: g.specialRequests,
        plusOneName: g.plusOneName,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching RSVP stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
