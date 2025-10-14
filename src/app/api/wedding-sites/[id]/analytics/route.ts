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

    // Fetch analytics data
    const [
      totalGuests,
      rsvpData,
      giftData,
      announcements,
      recentRSVPs,
      recentGifts
    ] = await Promise.all([
      // Total guests
      prisma.guest.count({
        where: { weddingSiteId: resolvedParams.id }
      }),

      // RSVP statistics
      prisma.rsvp.groupBy({
        by: ['status'],
        where: { weddingSiteId: resolvedParams.id },
        _count: { status: true }
      }),

      // Gift statistics
      prisma.gift.aggregate({
        where: {
          weddingSiteId: resolvedParams.id,
          status: 'COMPLETED'
        },
        _count: { id: true },
        _sum: { amount: true },
        _avg: { amount: true }
      }),

      // Announcements count
      prisma.announcement.count({
        where: { weddingSiteId: resolvedParams.id }
      }),

      // Recent RSVPs
      prisma.rsvp.findMany({
        where: { weddingSiteId: resolvedParams.id },
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent gifts
      prisma.gift.findMany({
        where: { weddingSiteId: resolvedParams.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Process RSVP data
    const rsvpStats = {
      attending: 0,
      notAttending: 0,
      pending: 0
    }

    rsvpData.forEach(item => {
      if (item.status === 'ATTENDING') {
        rsvpStats.attending = item._count.status
      } else if (item.status === 'NOT_ATTENDING') {
        rsvpStats.notAttending = item._count.status
      }
    })

    // Calculate pending RSVPs (guests without RSVPs)
    const totalRSVPs = rsvpStats.attending + rsvpStats.notAttending
    rsvpStats.pending = totalGuests - totalRSVPs

    // Process gift data
    const giftStats = {
      totalGifts: giftData._count.id || 0,
      totalAmount: giftData._sum.amount || 0,
      averageGift: giftData._avg.amount || 0
    }

    // Combine recent activity
    const recentActivity = [
      ...recentRSVPs.map(rsvp => ({
        type: 'rsvp',
        description: `${rsvp.guest.name} ${rsvp.status === 'ATTENDING' ? 'is attending' : 'is not attending'}`,
        date: rsvp.createdAt.toISOString()
      })),
      ...recentGifts.map(gift => ({
        type: 'gift',
        description: `${gift.guestName} sent a gift of $${gift.amount}`,
        date: gift.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

    const analytics = {
      totalGuests,
      rsvpStats,
      giftStats,
      siteViews: 0, // This would require a separate tracking system
      announcements,
      recentActivity
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}