import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.weddingSite.findUnique({
      where: { subdomain },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existing,
      subdomain
    })
  } catch (error) {
    console.error('Error checking subdomain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
