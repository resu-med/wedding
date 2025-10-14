import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.giftType || !data.siteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (data.giftType === 'MONETARY' && (!data.amount || !data.paymentMethod)) {
      return NextResponse.json(
        { error: 'Amount and payment method required for monetary gifts' },
        { status: 400 }
      )
    }

    if (data.giftType === 'EXPERIENCE' && !data.giftDescription) {
      return NextResponse.json(
        { error: 'Description required for experience gifts' },
        { status: 400 }
      )
    }

    if (!data.anonymous && !data.giverName) {
      return NextResponse.json(
        { error: 'Giver name required for non-anonymous gifts' },
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

    if (!weddingSite.giftsEnabled) {
      return NextResponse.json(
        { error: 'Gifts are not enabled for this wedding' },
        { status: 400 }
      )
    }

    // Create gift record
    const gift = await prisma.gift.create({
      data: {
        giftType: data.giftType,
        amount: data.amount ? parseFloat(data.amount) : null,
        message: data.message || null,
        giftDescription: data.giftDescription || null,
        paymentMethod: data.paymentMethod || 'OTHER',
        paymentStatus: 'PENDING',
        giverName: data.anonymous ? 'Anonymous' : data.giverName,
        giverEmail: data.anonymous ? null : (data.giverEmail || null),
        giverPhone: data.anonymous ? null : (data.giverPhone || null),
        anonymous: data.anonymous || false,
        weddingSiteId: data.siteId
      }
    })

    return NextResponse.json({ gift }, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}