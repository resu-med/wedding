import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolve4 = promisify(dns.resolve4)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Verify user owns this site
    const site = await prisma.weddingSite.findFirst({
      where: {
        id: resolvedParams.id,
        userId: session.user.id
      }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Check DNS records
    let verified = false
    let dnsInfo: { type: string; records: string[] }[] = []

    // Check if it's an apex domain (e.g., example.com vs www.example.com)
    const domainParts = domain.split('.')
    const isApexDomain = domainParts.length === 2

    try {
      if (isApexDomain) {
        // For apex domains, check A record
        const aRecords = await resolve4(domain)
        dnsInfo.push({ type: 'A', records: aRecords })

        // Vercel's IP address
        if (aRecords.includes('76.76.21.21')) {
          verified = true
        }
      } else {
        // For subdomains, check CNAME record
        const cnameRecords = await resolveCname(domain)
        dnsInfo.push({ type: 'CNAME', records: cnameRecords })

        // Check if pointing to Vercel
        if (cnameRecords.some(record =>
          record.includes('vercel') ||
          record.includes('cname.vercel-dns.com')
        )) {
          verified = true
        }
      }
    } catch (dnsError: any) {
      // DNS lookup failed - records not set up yet
      if (dnsError.code === 'ENODATA' || dnsError.code === 'ENOTFOUND') {
        return NextResponse.json({
          verified: false,
          message: 'DNS records not found. Please add the required DNS records and wait for propagation.',
          dnsInfo: []
        })
      }
      throw dnsError
    }

    return NextResponse.json({
      verified,
      message: verified
        ? 'Domain is properly configured!'
        : 'DNS records found but not pointing to Vercel. Please verify your configuration.',
      dnsInfo
    })
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json(
      { error: 'Failed to verify domain', verified: false },
      { status: 500 }
    )
  }
}
