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
      },
      include: {
        _count: {
          select: {
            guests: true,
            rsvps: true,
            gifts: true,
            announcements: true
          }
        }
      }
    })

    if (!weddingSite) {
      return NextResponse.json(
        { error: 'Wedding site not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(weddingSite)
  } catch (error) {
    console.error('Error fetching wedding site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const data = await request.json()

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

    const updatedSite = await prisma.weddingSite.update({
      where: { id: resolvedParams.id },
      data: {
        partner1Name: data.partner1Name || weddingSite.partner1Name,
        partner2Name: data.partner2Name || weddingSite.partner2Name,
        partner1Email: data.partner1Email || weddingSite.partner1Email,
        partner2Email: data.partner2Email || weddingSite.partner2Email,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : weddingSite.weddingDate,
        weddingTime: data.weddingTime !== undefined ? data.weddingTime : weddingSite.weddingTime,
        venueName: data.venueName || weddingSite.venueName,
        venueAddress: data.venueAddress || weddingSite.venueAddress,
        venueCity: data.venueCity || weddingSite.venueCity,
        venueState: data.venueState || weddingSite.venueState,
        venueZip: data.venueZip || weddingSite.venueZip,
        venueCountry: data.venueCountry || weddingSite.venueCountry,
        primaryColor: data.primaryColor || weddingSite.primaryColor,
        secondaryColor: data.secondaryColor || weddingSite.secondaryColor,
        welcomeMessage: data.welcomeMessage !== undefined ? data.welcomeMessage : weddingSite.welcomeMessage,
        aboutUsStory: data.aboutUsStory !== undefined ? data.aboutUsStory : weddingSite.aboutUsStory,
        accommodationInfo: data.accommodationInfo !== undefined ? data.accommodationInfo : weddingSite.accommodationInfo,
        transportInfo: data.transportInfo !== undefined ? data.transportInfo : weddingSite.transportInfo,
        scheduleDetails: data.scheduleDetails !== undefined ? data.scheduleDetails : weddingSite.scheduleDetails,
        specialRequests: data.specialRequests !== undefined ? data.specialRequests : weddingSite.specialRequests,
        rsvpEnabled: data.rsvpEnabled !== undefined ? data.rsvpEnabled : weddingSite.rsvpEnabled,
        giftsEnabled: data.giftsEnabled !== undefined ? data.giftsEnabled : weddingSite.giftsEnabled,
        accommodationEnabled: data.accommodationEnabled !== undefined ? data.accommodationEnabled : weddingSite.accommodationEnabled,
        transportEnabled: data.transportEnabled !== undefined ? data.transportEnabled : weddingSite.transportEnabled,
        guestListEnabled: data.guestListEnabled !== undefined ? data.guestListEnabled : weddingSite.guestListEnabled,
        rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : weddingSite.rsvpDeadline,
        paypalEmail: data.paypalEmail !== undefined ? data.paypalEmail : weddingSite.paypalEmail,
        bankDetails: data.bankDetails !== undefined ? data.bankDetails : weddingSite.bankDetails,
        bankName: data.bankName !== undefined ? data.bankName : weddingSite.bankName,
        bankAccountName: data.bankAccountName !== undefined ? data.bankAccountName : weddingSite.bankAccountName,
        bankIban: data.bankIban !== undefined ? data.bankIban : weddingSite.bankIban,
        bankBic: data.bankBic !== undefined ? data.bankBic : weddingSite.bankBic,
        bankReference: data.bankReference !== undefined ? data.bankReference : weddingSite.bankReference,
        giftMessage: data.giftMessage !== undefined ? data.giftMessage : weddingSite.giftMessage,
        giftCurrency: data.giftCurrency !== undefined ? data.giftCurrency : weddingSite.giftCurrency,
      }
    })

    return NextResponse.json(updatedSite)
  } catch (error) {
    console.error('Error updating wedding site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    await prisma.weddingSite.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Wedding site deleted successfully' })
  } catch (error) {
    console.error('Error deleting wedding site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}