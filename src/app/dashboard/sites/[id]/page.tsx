'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  MapPin,
  Gift,
  MessageCircle,
  Camera,
  ExternalLink,
  Edit,
  Eye,
  BarChart3,
  Mail,
  Globe,
  Trash2
} from 'lucide-react'

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
        fetchData() // Refresh the data
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Site Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="text-pink-600 hover:text-pink-500 font-medium"
          >
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/site/${site.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                View Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {site.partner1Name} & {site.partner2Name}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {site.venueName}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Website: </span>
                <span className="font-medium">localhost:3001/site/{site.subdomain}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/dashboard/sites/${siteId}/edit`}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Details</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total RSVPs"
            value={rsvpStats ? `${rsvpStats.summary.attending + rsvpStats.summary.notAttending}` : '0'}
            subtitle={rsvpStats ? `out of ${rsvpStats.summary.totalGuests} invited` : 'out of 0 invited'}
            icon={<Users className="h-6 w-6 text-blue-500" />}
            color="blue"
          />
          <StatCard
            title="Gifts Received"
            value={`${currencySymbol}${totalGiftAmount.toFixed(0)}`}
            subtitle={`${completedGifts.length} gift${completedGifts.length !== 1 ? 's' : ''}`}
            icon={<Gift className="h-6 w-6 text-green-500" />}
            color="green"
          />
          <StatCard
            title="Attending"
            value={rsvpStats ? `${rsvpStats.summary.attending}` : '0'}
            subtitle={rsvpStats && rsvpStats.summary.totalGuests > 0
              ? `${Math.round((rsvpStats.summary.attending / rsvpStats.summary.totalGuests) * 100)}% of guests`
              : '0% of guests'}
            icon={<Eye className="h-6 w-6 text-purple-500" />}
            color="purple"
          />
          <StatCard
            title="Awaiting Response"
            value={rsvpStats ? `${rsvpStats.summary.pending}` : '0'}
            subtitle="pending RSVPs"
            icon={<MessageCircle className="h-6 w-6 text-orange-500" />}
            color="orange"
          />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Management */}
          <ManagementCard
            title="Guest Management"
            description="Manage your guest list, send invitations, and track RSVPs"
            icon={<Users className="h-8 w-8 text-blue-500" />}
            actions={[
              { label: "RSVP Dashboard", href: `/dashboard/sites/${siteId}/rsvp-dashboard`, primary: true },
              { label: "Manage Guests", href: `/dashboard/sites/${siteId}/guests` },
              { label: "Send Invitations", href: "#" }
            ]}
          />

          {/* Wedding Details */}
          <ManagementCard
            title="Wedding Details"
            description="Update ceremony and reception information, timeline, and venue details"
            icon={<Calendar className="h-8 w-8 text-pink-500" />}
            actions={[
              { label: "Edit Wedding Info", href: `/dashboard/sites/${siteId}/edit`, primary: true },
              { label: "Venue Details", href: `/dashboard/sites/${siteId}/edit?tab=venue` },
              { label: "Content", href: `/dashboard/sites/${siteId}/edit?tab=content` }
            ]}
          />

          {/* Gift Registry */}
          <ManagementCard
            title="Gift Registry"
            description="Manage gift preferences, payment settings, and view received gifts"
            icon={<Gift className="h-8 w-8 text-green-500" />}
            actions={[
              { label: "Gift Settings", href: `/dashboard/sites/${siteId}/gift-settings`, primary: true },
              { label: "Payment Setup", href: `/dashboard/sites/${siteId}/gift-settings?tab=payment` },
              { label: "Gift Reports", href: `/dashboard/sites/${siteId}/gift-settings?tab=reports` }
            ]}
          />

          {/* Accommodation */}
          <ManagementCard
            title="Accommodation"
            description="Add recommended hotels and places to stay for your guests"
            icon={<MapPin className="h-8 w-8 text-teal-500" />}
            actions={[
              { label: "Manage Stays", href: `/dashboard/sites/${siteId}/accommodation`, primary: true },
              { label: "Edit Info", href: `/dashboard/sites/${siteId}/edit?tab=content` }
            ]}
          />

          {/* Site Customization */}
          <ManagementCard
            title="Site Customization"
            description="Customize your website appearance, upload photos, and manage content"
            icon={<Camera className="h-8 w-8 text-purple-500" />}
            actions={[
              { label: "Edit Design", href: `/dashboard/sites/${siteId}/edit?tab=settings`, primary: true },
              { label: "Photo Gallery", href: `/dashboard/sites/${siteId}/gallery` },
              { label: "Content Editor", href: `/dashboard/sites/${siteId}/edit?tab=content` }
            ]}
          />

          {/* Communication */}
          <ManagementCard
            title="Guest Communication"
            description="Send announcements, updates, and manage guest messages"
            icon={<Mail className="h-8 w-8 text-orange-500" />}
            actions={[
              { label: "Manage Announcements", href: `/dashboard/sites/${siteId}/announcements`, primary: true },
              { label: "View Messages", href: "#" },
              { label: "Email Templates", href: "#" }
            ]}
          />

          {/* Analytics */}
          <ManagementCard
            title="Analytics"
            description="View site statistics, RSVP trends, and guest engagement metrics"
            icon={<BarChart3 className="h-8 w-8 text-indigo-500" />}
            actions={[
              { label: "View Analytics", href: `/dashboard/sites/${siteId}/analytics`, primary: true },
              { label: "RSVP Trends", href: "#" },
              { label: "Export Data", href: "#" }
            ]}
          />

          {/* Custom Domain */}
          <ManagementCard
            title="Custom Domain"
            description="Connect your own domain to make your wedding site URL memorable and easy to share"
            icon={<Globe className="h-8 w-8 text-cyan-500" />}
            actions={[
              { label: "Domain Settings", href: `/dashboard/sites/${siteId}/domain`, primary: true }
            ]}
          />

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
                <p className="mt-1 text-sm text-gray-600">Clear RSVP responses or gift records. Useful for testing or starting fresh.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => clearData('rsvps')}
                    disabled={clearing !== null}
                    className="px-3 py-2 rounded text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                  >
                    {clearing === 'rsvps' ? 'Clearing...' : 'Clear RSVPs'}
                  </button>
                  <button
                    onClick={() => clearData('gifts')}
                    disabled={clearing !== null}
                    className="px-3 py-2 rounded text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                  >
                    {clearing === 'gifts' ? 'Clearing...' : 'Clear Gifts'}
                  </button>
                  <button
                    onClick={() => clearData('all')}
                    disabled={clearing !== null}
                    className="px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {clearing === 'all' ? 'Clearing...' : 'Clear All Data'}
                  </button>
                </div>
              </div>
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
  color: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  )
}

function ManagementCard({ title, description, icon, actions }: {
  title: string
  description: string
  icon: React.ReactNode
  actions: Array<{ label: string; href: string; primary?: boolean }>
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  action.primary
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}