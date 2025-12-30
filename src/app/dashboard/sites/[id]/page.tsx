'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Gift,
  MessageCircle,
  Camera,
  ExternalLink,
  Edit,
  BarChart3,
  Globe,
  Trash2,
  ChevronRight,
  Heart,
  Clock,
  Hotel
} from 'lucide-react'
import { Logo } from '@/components/Logo'

interface WeddingSite {
  id: string
  subdomain: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  weddingTime?: string
  venueName: string
  venueAddress: string
  venueCity: string
  venueState: string
  primaryColor: string
  secondaryColor: string
  welcomeMessage?: string
  aboutUsStory?: string
  createdAt: string
  giftCurrency?: string
}

interface RsvpStats {
  summary: {
    totalGuests: number
    attending: number
    notAttending: number
    pending: number
    responseRate: number
  }
}

interface Gift {
  id: string
  amount: number | null
  paymentStatus: string
  giftCurrency?: string
}

export default function WeddingSiteManagement({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [site, setSite] = useState<WeddingSite | null>(null)
  const [rsvpStats, setRsvpStats] = useState<RsvpStats | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [siteId, setSiteId] = useState<string>('')
  const [clearing, setClearing] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSiteId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!session || !siteId) {
      if (!session) {
        router.push('/auth/signin')
      }
      return
    }

    fetchData()
  }, [session, siteId, router])

  const fetchData = async () => {
    try {
      const [siteResponse, statsResponse, giftsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/rsvp-stats`),
        fetch(`/api/wedding-sites/${siteId}/gifts`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
      } else {
        setError('Wedding site not found')
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setRsvpStats(statsData)
      }

      if (giftsResponse.ok) {
        const giftsData = await giftsResponse.json()
        setGifts(giftsData)
      }
    } catch (error) {
      setError('Error loading wedding site')
    } finally {
      setLoading(false)
    }
  }

  // Calculate gift totals
  const completedGifts = gifts.filter(g => g.paymentStatus === 'COMPLETED')
  const totalGiftAmount = completedGifts.reduce((sum, g) => sum + (Number(g.amount) || 0), 0)
  const giftCurrency = site?.giftCurrency || 'EUR'
  const currencySymbol = giftCurrency === 'EUR' ? '€' : giftCurrency === 'GBP' ? '£' : '$'

  const clearData = async (type: 'rsvps' | 'gifts' | 'all') => {
    const confirmMessage = type === 'all'
      ? 'Are you sure you want to clear ALL RSVPs and gifts? This cannot be undone.'
      : type === 'rsvps'
      ? 'Are you sure you want to clear all RSVPs? Guest RSVP status will be reset to pending. This cannot be undone.'
      : 'Are you sure you want to clear all gifts? This cannot be undone.'

    if (!confirm(confirmMessage)) return

    setClearing(type)
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/clear-data?type=${type}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert(`${type === 'all' ? 'All data' : type === 'rsvps' ? 'RSVP data' : 'Gift data'} cleared successfully!`)
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to clear data')
      }
    } catch (error) {
      alert('Failed to clear data')
    } finally {
      setClearing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-100 rounded-full mx-auto" />
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading your wedding site...</p>
        </div>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-500 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

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
                href="/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
            <a
              href={`https://${site.subdomain}.weddingprepped.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Site</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
                  {site.partner1Name} & {site.partner2Name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {site.venueName}
                  </div>
                </div>
                <p className="mt-3 text-white/70 text-sm">
                  {site.subdomain}.weddingprepped.com
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/sites/${siteId}/edit`}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Link>
              </div>
            </div>

            {/* Countdown */}
            {daysUntil > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{daysUntil} days until your big day!</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total RSVPs"
            value={rsvpStats ? `${rsvpStats.summary.attending + rsvpStats.summary.notAttending}` : '0'}
            subtitle={rsvpStats ? `of ${rsvpStats.summary.totalGuests} invited` : 'of 0 invited'}
            icon={<Users className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Gifts Received"
            value={`${currencySymbol}${totalGiftAmount.toFixed(0)}`}
            subtitle={`${completedGifts.length} gift${completedGifts.length !== 1 ? 's' : ''}`}
            icon={<Gift className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Attending"
            value={rsvpStats ? `${rsvpStats.summary.attending}` : '0'}
            subtitle={rsvpStats && rsvpStats.summary.totalGuests > 0
              ? `${Math.round((rsvpStats.summary.attending / rsvpStats.summary.totalGuests) * 100)}% of guests`
              : '0% of guests'}
            icon={<Heart className="h-5 w-5" />}
            color="pink"
          />
          <StatCard
            title="Awaiting"
            value={rsvpStats ? `${rsvpStats.summary.pending}` : '0'}
            subtitle="pending responses"
            icon={<MessageCircle className="h-5 w-5" />}
            color="amber"
          />
        </div>

        {/* Management Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ManagementCard
            title="Guest Management"
            description="Manage your guest list and track RSVPs"
            icon={<Users className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/guests`}
            color="blue"
            actions={[
              { label: "RSVP Dashboard", href: `/dashboard/sites/${siteId}/rsvp-dashboard` },
              { label: "Manage Guests", href: `/dashboard/sites/${siteId}/guests` }
            ]}
          />

          <ManagementCard
            title="Wedding Details"
            description="Edit venue, date, and ceremony info"
            icon={<Calendar className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/edit`}
            color="pink"
            actions={[
              { label: "Edit Info", href: `/dashboard/sites/${siteId}/edit` }
            ]}
          />

          <ManagementCard
            title="Gift Registry"
            description="Manage gifts and payment settings"
            icon={<Gift className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/gift-settings`}
            color="green"
            actions={[
              { label: "Gift Settings", href: `/dashboard/sites/${siteId}/gift-settings` }
            ]}
          />

          <ManagementCard
            title="Photo Gallery"
            description="Upload and manage your photos"
            icon={<Camera className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/gallery`}
            color="purple"
            actions={[
              { label: "Manage Gallery", href: `/dashboard/sites/${siteId}/gallery` }
            ]}
          />

          <ManagementCard
            title="Accommodation"
            description="Add hotels for your guests"
            icon={<Hotel className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/accommodation`}
            color="teal"
            actions={[
              { label: "Manage Stays", href: `/dashboard/sites/${siteId}/accommodation` }
            ]}
          />

          <ManagementCard
            title="Announcements"
            description="Send updates to your guests"
            icon={<MessageCircle className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/announcements`}
            color="orange"
            actions={[
              { label: "Manage", href: `/dashboard/sites/${siteId}/announcements` }
            ]}
          />

          <ManagementCard
            title="Analytics"
            description="View site stats and engagement"
            icon={<BarChart3 className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/analytics`}
            color="indigo"
            actions={[
              { label: "View Stats", href: `/dashboard/sites/${siteId}/analytics` }
            ]}
          />

          <ManagementCard
            title="Custom Domain"
            description="Connect your own domain"
            icon={<Globe className="h-6 w-6" />}
            href={`/dashboard/sites/${siteId}/domain`}
            color="cyan"
            actions={[
              { label: "Settings", href: `/dashboard/sites/${siteId}/domain` }
            ]}
          />

          {/* Data Management Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-red-100 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Management</h3>
                <p className="text-sm text-gray-500">Clear test data</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => clearData('rsvps')}
                disabled={clearing !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {clearing === 'rsvps' ? 'Clearing...' : 'Clear RSVPs'}
              </button>
              <button
                onClick={() => clearData('gifts')}
                disabled={clearing !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {clearing === 'gifts' ? 'Clearing...' : 'Clear Gifts'}
              </button>
              <button
                onClick={() => clearData('all')}
                disabled={clearing !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                {clearing === 'all' ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'pink' | 'amber' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    pink: 'bg-pink-50 text-pink-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

function ManagementCard({ title, description, icon, href, color, actions }: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'teal' | 'indigo' | 'cyan'
  actions: Array<{ label: string; href: string }>
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500'
  }

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-pink-100 transition-all block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}
