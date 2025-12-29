import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Look up site by custom domain (check both with and without www)
    const cleanDomain = domain.replace(/^www\./, '')

    const site = await prisma.weddingSite.findFirst({
      where: {
        OR: [
          { customDomain: domain },
          { customDomain: cleanDomain },
          { customDomain: `www.${cleanDomain}` }
        ]
      },
      select: {
        subdomain: true
      }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ subdomain: site.subdomain })
  } catch (error) {
    console.error('Error looking up domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
