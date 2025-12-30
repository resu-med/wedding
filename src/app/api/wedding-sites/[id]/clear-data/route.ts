import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

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

    // Verify the wedding site belongs to this user
    const weddingSite = await prisma.weddingSite.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!weddingSite) {
      return NextResponse.json(
        { error: 'Wedding site not found' },
        { status: 404 }
      )
    }

    // Get the data type to clear from query params
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type')

    if (dataType === 'rsvps') {
      // Delete all RSVPs for this site
      await prisma.rsvp.deleteMany({
        where: { weddingSiteId: id }
      })

      // Reset guest RSVP status
      await prisma.guest.updateMany({
        where: { weddingSiteId: id },
        data: {
          rsvpStatus: 'PENDING',
          attendingCeremony: null,
          attendingReception: null,
          dietaryRequests: null,
          specialRequests: null,
          plusOneName: null,
          needsBusToVenue: null,
          needsBusFromVenue: null
        }
      })

      return NextResponse.json({ message: 'RSVP data cleared successfully' })
    }

    if (dataType === 'gifts') {
      // Delete all gifts for this site
      await prisma.gift.deleteMany({
        where: { weddingSiteId: id }
      })

      return NextResponse.json({ message: 'Gift data cleared successfully' })
    }

    if (dataType === 'all') {
      // Delete RSVPs
      await prisma.rsvp.deleteMany({
        where: { weddingSiteId: id }
      })

      // Reset guest RSVP status
      await prisma.guest.updateMany({
        where: { weddingSiteId: id },
        data: {
          rsvpStatus: 'PENDING',
          attendingCeremony: null,
          attendingReception: null,
          dietaryRequests: null,
          specialRequests: null,
          plusOneName: null,
          needsBusToVenue: null,
          needsBusFromVenue: null
        }
      })

      // Delete gifts
      await prisma.gift.deleteMany({
        where: { weddingSiteId: id }
      })

      return NextResponse.json({ message: 'All data cleared successfully' })
    }

    return NextResponse.json(
      { error: 'Invalid data type. Use ?type=rsvps, ?type=gifts, or ?type=all' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
