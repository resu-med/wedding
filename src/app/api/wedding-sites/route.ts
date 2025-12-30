import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidSubdomain } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const weddingSites = await prisma.weddingSite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(weddingSites)
  } catch (error) {
    console.error('Error fetching wedding sites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        weddingSites: {
          select: { id: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has paid
    if (!user.hasPaid) {
      return NextResponse.json(
        { error: 'Payment required to create a wedding site' },
        { status: 402 }
      )
    }

    // Check if user already has a wedding site (limit 1 per account)
    if (user.weddingSites.length > 0) {
      return NextResponse.json(
        { error: 'You already have a wedding site. Each account is limited to one site.' },
        { status: 400 }
      )
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'partner1Name', 'partner2Name', 'weddingDate', 'venueName',
      'venueAddress', 'venueCity', 'venueState', 'venueZip', 'subdomain'
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate subdomain
    if (!isValidSubdomain(data.subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format' },
        { status: 400 }
      )
    }

    // Check if subdomain is already taken
    const existingSubdomain = await prisma.weddingSite.findUnique({
      where: { subdomain: data.subdomain }
    })

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 400 }
      )
    }

    // Parse wedding date
    const weddingDate = new Date(data.weddingDate)
    if (isNaN(weddingDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid wedding date' },
        { status: 400 }
      )
    }

    const weddingSite = await prisma.weddingSite.create({
      data: {
        userId: user.id,
        subdomain: data.subdomain,
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        partner1Email: data.partner1Email || null,
        partner2Email: data.partner2Email || null,
        weddingDate,
        weddingTime: data.weddingTime || null,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueCity: data.venueCity,
        venueState: data.venueState,
        venueZip: data.venueZip,
        venueCountry: data.venueCountry || 'United States',
        primaryColor: data.primaryColor || '#d946ef',
        secondaryColor: data.secondaryColor || '#f3f4f6',
        welcomeMessage: data.welcomeMessage || null,
        aboutUsStory: data.aboutUsStory || null,
      }
    })

    return NextResponse.json(weddingSite, { status: 201 })
  } catch (error) {
    console.error('Error creating wedding site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}