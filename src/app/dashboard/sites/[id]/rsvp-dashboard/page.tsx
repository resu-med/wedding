'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Check,
  X,
  Clock,
  HelpCircle,
  Download,
  TrendingUp,
  Utensils,
  Calendar,
  UserPlus,
  MessageSquare,
  PartyPopper,
  Heart,
  Bus
} from 'lucide-react'

interface RsvpStats {
  summary: {
    totalGuests: number
    attending: number
    notAttending: number
    pending: number
    maybe: number
    responseRate: number
    plusOnes: number
    totalAttending: number
    needsBusToVenue: number
    needsBusFromVenue: number
  }
  eventBreakdown: {
    ceremony: number
    reception: number
  }
  dietaryRequirements: Array<{
    requirement: string
    count: number
    guests: string[]
  }>
  specialRequests: Array<{
    guestName: string
    request: string
  }>
  categoryBreakdown: Array<{
    category: string
    total: number
    attending: number
  }>
  recentRsvps: Array<{
    id: string
    guestName: string
    guestEmail: string
    status: string
    attendingCeremony: boolean
    attendingReception: boolean
    message: string | null
    submittedAt: string
  }>
  guests: Array<{
    id: string
    name: string
    email: string | null
    phone: string | null
    category: string | null
    rsvpStatus: string
    attendingCeremony: boolean | null
    attendingReception: boolean | null
    dietaryRequests: string | null
    specialRequests: string | null
    needsBusToVenue: boolean | null
    needsBusFromVenue: boolean | null
    plusOneName: string | null
    createdAt: string
    updatedAt: string
  }>
}

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  rsvpDeadline: string | null
}

export default function RSVPDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [siteId, setSiteId] = useState<string>('')
  const [site, setSite] = useState<WeddingSite | null>(null)
  const [stats, setStats] = useState<RsvpStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedDietary, setExpandedDietary] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      setSiteId(params.id as string)
    }
  }, [params.id])

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
      const [siteResponse, statsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/rsvp-stats`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!stats) return

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Category',
      'RSVP Status',
      'Attending Ceremony',
      'Attending Reception',
      'Bus To Venue',
      'Bus From Venue',
      'Dietary Requirements',
      'Special Requests',
      'Plus One Name'
    ]

    const rows = stats.guests.map(guest => [
      guest.name,
      guest.email || '',
      guest.phone || '',
      guest.category || '',
      guest.rsvpStatus,
      guest.attendingCeremony ? 'Yes' : 'No',
      guest.attendingReception ? 'Yes' : 'No',
      guest.needsBusToVenue ? 'Yes' : 'No',
      guest.needsBusFromVenue ? 'Yes' : 'No',
      guest.dietaryRequests || '',
      guest.specialRequests || '',
      guest.plusOneName || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rsvp-list-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATTENDING': return 'text-green-600 bg-green-100'
      case 'NOT_ATTENDING': return 'text-red-600 bg-red-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'MAYBE': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilDeadline = () => {
    if (!site?.rsvpDeadline) return null
    const deadline = new Date(site.rsvpDeadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const daysUntilDeadline = getDaysUntilDeadline()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/sites/${siteId}`}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Site
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <Link
                href={`/dashboard/sites/${siteId}/guests`}
                className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Manage Guests</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              RSVP Dashboard
            </h1>
            <p className="text-gray-600">
              {site.partner1Name} & {site.partner2Name}&apos;s Wedding
            </p>
          </div>
        )}

        {/* RSVP Deadline Alert */}
        {daysUntilDeadline !== null && daysUntilDeadline <= 14 && (
          <div className={`mb-6 p-4 rounded-lg ${daysUntilDeadline <= 3 ? 'bg-red-100 border border-red-300' : 'bg-yellow-100 border border-yellow-300'}`}>
            <div className="flex items-center">
              <Calendar className={`h-5 w-5 mr-2 ${daysUntilDeadline <= 3 ? 'text-red-600' : 'text-yellow-600'}`} />
              <span className={`font-medium ${daysUntilDeadline <= 3 ? 'text-red-800' : 'text-yellow-800'}`}>
                {daysUntilDeadline > 0
                  ? `RSVP deadline in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`
                  : 'RSVP deadline has passed'}
              </span>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.summary.totalGuests}</p>
                <p className="text-sm text-gray-500 mt-1">Total Guests</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <Check className="h-8 w-8 text-green-500" />
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Confirmed</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.summary.attending}</p>
                <p className="text-sm text-gray-500 mt-1">Attending</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-600">{stats.summary.notAttending}</p>
                <p className="text-sm text-gray-500 mt-1">Not Attending</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.summary.pending}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting Response</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <UserPlus className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.summary.plusOnes}</p>
                <p className="text-sm text-gray-500 mt-1">Plus Ones</p>
              </div>
            </div>

            {/* Response Rate & Event Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Response Rate */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Response Rate</h3>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{stats.summary.responseRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${stats.summary.responseRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.summary.attending}</p>
                    <p className="text-xs text-gray-500">Yes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.summary.notAttending}</p>
                    <p className="text-xs text-gray-500">No</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.summary.pending + stats.summary.maybe}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              </div>

              {/* Event Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event Attendance</h3>
                  <PartyPopper className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-pink-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Ceremony</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stats.eventBreakdown.ceremony}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.summary.totalGuests > 0 ? (stats.eventBreakdown.ceremony / stats.summary.totalGuests) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <PartyPopper className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Reception</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stats.eventBreakdown.reception}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.summary.totalGuests > 0 ? (stats.eventBreakdown.reception / stats.summary.totalGuests) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-900">{stats.summary.totalAttending}</strong> total guests expected (including plus ones)
                  </p>
                </div>

                {/* Bus Transfer */}
                {(stats.summary.needsBusToVenue > 0 || stats.summary.needsBusFromVenue > 0) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2">
                      <Bus className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Bus Transfer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">To venue:</span>
                        <span className="font-bold text-blue-900 ml-2">{stats.summary.needsBusToVenue}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">From venue:</span>
                        <span className="font-bold text-blue-900 ml-2">{stats.summary.needsBusFromVenue}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dietary Requirements & Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Dietary Requirements */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dietary Requirements</h3>
                  <Utensils className="h-5 w-5 text-gray-400" />
                </div>
                {stats.dietaryRequirements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No dietary requirements specified</p>
                ) : (
                  <div className="space-y-3">
                    {stats.dietaryRequirements.map((item, index) => (
                      <div key={index}>
                        <button
                          onClick={() => setExpandedDietary(expandedDietary === item.requirement ? null : item.requirement)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{item.requirement}</span>
                          <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-sm font-medium">
                            {item.count} guest{item.count !== 1 ? 's' : ''}
                          </span>
                        </button>
                        {expandedDietary === item.requirement && (
                          <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{item.guests.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Categories</h3>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                {stats.categoryBreakdown.length === 0 ? (
                  <p className="text-gray-500 text-sm">No categories defined</p>
                ) : (
                  <div className="space-y-3">
                    {stats.categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{category.category}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            <span className="text-green-600 font-medium">{category.attending}</span>/{category.total} attending
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${category.total > 0 ? (category.attending / category.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent RSVPs & Special Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent RSVPs */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent RSVPs</h3>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                {stats.recentRsvps.length === 0 ? (
                  <p className="text-gray-500 text-sm">No RSVPs yet</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {stats.recentRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{rsvp.guestName}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rsvp.status)}`}>
                              {rsvp.status === 'ATTENDING' && <Check className="h-3 w-3 mr-1" />}
                              {rsvp.status === 'NOT_ATTENDING' && <X className="h-3 w-3 mr-1" />}
                              {rsvp.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(rsvp.submittedAt)}</p>
                          {rsvp.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">&quot;{rsvp.message}&quot;</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Special Requests</h3>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                {stats.specialRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No special requests</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {stats.specialRequests.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900 text-sm">{item.guestName}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.request}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
