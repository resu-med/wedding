import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const weddingSite = await prisma.weddingSite.findUnique({
      where: {
        subdomain: params.subdomain
      },
      select: {
        id: true,
        subdomain: true,
        partner1Name: true,
        partner2Name: true,
        partner1Email: true,
        partner2Email: true,
        weddingDate: true,
        weddingTime: true,
        venueName: true,
        venueAddress: true,
        venueCity: true,
        venueState: true,
        venueZip: true,
        venueCountry: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        heroImage: true,
        couplePhoto: true,
        galleryImages: true,
        rsvpEnabled: true,
        rsvpDeadline: true,
        giftsEnabled: true,
        accommodationEnabled: true,
        transportEnabled: true,
        guestListEnabled: true,
        welcomeMessage: true,
        aboutUsStory: true,
        scheduleDetails: true,
        accommodationInfo: true,
        accommodationPlaces: true,
        transportInfo: true,
        specialRequests: true,
        paypalEmail: true,
        bankName: true,
        bankAccountName: true,
        bankIban: true,
        bankBic: true,
        bankReference: true,
        giftMessage: true,
        giftCurrency: true,
        venueLat: true,
        venueLng: true,
        venueGoogleMapsUrl: true,
        venuePhotos: true,
        venuePlaceId: true,
        createdAt: true,
        updatedAt: true
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
    console.error('Error fetching public wedding site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}