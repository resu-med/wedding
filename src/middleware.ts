import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of known app domains that should NOT trigger custom domain routing
const APP_DOMAINS = [
  'localhost',
  'wedding-tiv4.vercel.app',
  'vercel.app'
]

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard/')
  ) {
    return NextResponse.next()
  }

  // Check if this is an app domain (not a custom domain)
  const isAppDomain = APP_DOMAINS.some(domain => hostname.includes(domain))

  if (isAppDomain) {
    return NextResponse.next()
  }

  // This is a custom domain - look up which site it belongs to
  try {
    // Get the base URL for the API call
    const protocol = request.nextUrl.protocol
    const baseUrl = `${protocol}//${hostname}`

    const response = await fetch(`${baseUrl}/api/public/domain-lookup?domain=${encodeURIComponent(hostname)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.subdomain) {
        // Rewrite to the site page
        const url = request.nextUrl.clone()
        url.pathname = `/site/${data.subdomain}${pathname === '/' ? '' : pathname}`
        return NextResponse.rewrite(url)
      }
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
