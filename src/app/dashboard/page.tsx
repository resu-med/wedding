'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, ExternalLink, Calendar, Users, Gift, BarChart3, LogOut, Heart, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface WeddingSite {
  id: string
  subdomain: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  createdAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [weddingSites, setWeddingSites] = useState<WeddingSite[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchWeddingSites()
  }, [session, status, router])

  const fetchWeddingSites = async () => {
    try {
      const response = await fetch('/api/wedding-sites')
      if (response.ok) {
        const sites = await response.json()
        setWeddingSites(sites)
      }
    } catch (error) {
      console.error('Error fetching wedding sites:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-100 rounded-full mx-auto" />
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/create"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Wedding Site
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600 mt-1">Manage your wedding website and track your guests.</p>
        </div>

        {weddingSites.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-pink-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                Create Your Wedding Website
              </h2>
              <p className="text-gray-600 mb-8">
                Get started by creating your beautiful, personalized wedding website. Share your love story with your guests!
              </p>
              <Link
                href="/dashboard/create"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Wedding Site
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          /* Sites Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weddingSites.map((site) => (
              <WeddingSiteCard key={site.id} site={site} />
            ))}
          </div>
        )}

        {/* Mobile Create Button */}
        {weddingSites.length > 0 && (
          <div className="fixed bottom-6 right-6 sm:hidden">
            <Link
              href="/dashboard/create"
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full shadow-lg shadow-pink-500/25"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function WeddingSiteCard({ site }: { site: WeddingSite }) {
  const weddingDate = new Date(site.weddingDate)
  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate days until wedding
  const today = new Date()
  const daysUntil = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-pink-100 transition-all overflow-hidden group">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold">
              {site.partner1Name} & {site.partner2Name}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {site.subdomain}.weddingprepped.com
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://${site.subdomain}.weddingprepped.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Countdown */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-pink-50 rounded-xl">
          <Calendar className="h-5 w-5 text-pink-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {daysUntil > 0 ? `${daysUntil} days to go!` : daysUntil === 0 ? "It's your big day!" : 'Wedding day passed'}
            </p>
            <p className="text-xs text-gray-600">{formattedDate}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={<Users className="h-4 w-4" />} label="RSVPs" value="0" />
          <StatCard icon={<Gift className="h-4 w-4" />} label="Gifts" value="0" />
          <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Views" value="0" />
        </div>

        {/* Action Button */}
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-pink-50 hover:text-pink-600 transition-all group-hover:bg-pink-50 group-hover:text-pink-600"
        >
          <Settings className="h-4 w-4" />
          Manage Site
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-xl">
      <div className="flex justify-center text-gray-400 mb-1">
        {icon}
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
