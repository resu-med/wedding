'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface DashboardLayoutProps {
  children: React.ReactNode
  siteId?: string
  siteName?: string
  subdomain?: string
  backHref?: string
  backLabel?: string
}

export function DashboardLayout({
  children,
  siteId,
  siteName,
  subdomain,
  backHref = '/dashboard',
  backLabel = 'Back to Dashboard'
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex-shrink-0">
                <Logo size="sm" />
              </Link>
              <Link
                href={backHref}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            </div>

            {subdomain && (
              <a
                href={`https://${subdomain}.weddingprepped.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  )
}
