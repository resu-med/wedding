'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Users,
  Gift,
  Eye,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  createdAt: string
}

interface AnalyticsData {
  totalGuests: number
  rsvpStats: {
    attending: number
    notAttending: number
    pending: number
  }
  giftStats: {
    totalGifts: number
    totalAmount: number
    averageGift: number
  }
  siteViews: number
  announcements: number
  recentActivity: Array<{
    type: string
    description: string
    date: string
  }>
}

export default function Analytics() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [siteId, setSiteId] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      setSiteId(params.id as string)
    }
  }, [params.id])

  const [site, setSite] = useState<WeddingSite | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

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
      const [siteResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/analytics`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRSVPRate = () => {
    if (!analytics) return 0
    const total = analytics.rsvpStats.attending + analytics.rsvpStats.notAttending + analytics.rsvpStats.pending
    if (total === 0) return 0
    return Math.round(((analytics.rsvpStats.attending + analytics.rsvpStats.notAttending) / total) * 100)
  }

  const getAttendanceRate = () => {
    if (!analytics) return 0
    const responded = analytics.rsvpStats.attending + analytics.rsvpStats.notAttending
    if (responded === 0) return 0
    return Math.round((analytics.rsvpStats.attending / responded) * 100)
  }

  const getDaysUntilWedding = () => {
    if (!site) return 0
    const weddingDate = new Date(site.weddingDate)
    const today = new Date()
    const diffTime = weddingDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

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
                Back to Site Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {site.partner1Name} & {site.partner2Name}
            </h2>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(site.weddingDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {getDaysUntilWedding()} days to go
              </div>
            </div>
          </div>
        )}

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Guests</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalGuests}</p>
                    <p className="text-sm text-green-600">Invited</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">RSVP Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{getRSVPRate()}%</p>
                    <p className="text-sm text-gray-500">Responded</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Gifts</p>
                    <p className="text-2xl font-semibold text-gray-900">${analytics.giftStats.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{analytics.giftStats.totalGifts} gifts</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Site Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.siteViews}</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* RSVP Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">RSVP Overview</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Attending</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{analytics.rsvpStats.attending}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({analytics.totalGuests > 0 ? Math.round((analytics.rsvpStats.attending / analytics.totalGuests) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Not Attending</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{analytics.rsvpStats.notAttending}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({analytics.totalGuests > 0 ? Math.round((analytics.rsvpStats.notAttending / analytics.totalGuests) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{analytics.rsvpStats.pending}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({analytics.totalGuests > 0 ? Math.round((analytics.rsvpStats.pending / analytics.totalGuests) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{getAttendanceRate()}%</div>
                      <div className="text-sm text-gray-500">Attendance Rate</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Of those who responded
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift Statistics */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Gift Statistics</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${analytics.giftStats.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Amount Received</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">{analytics.giftStats.totalGifts}</div>
                        <div className="text-sm text-gray-500">Total Gifts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">
                          ${analytics.giftStats.averageGift.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Average Gift</div>
                      </div>
                    </div>

                    {analytics.totalGuests > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">
                            {Math.round((analytics.giftStats.totalGifts / analytics.totalGuests) * 100)}%
                          </div>
                          <div className="text-sm text-gray-500">Gift Participation Rate</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-gray-500 hover:text-gray-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
              <div className="p-6">
                {analytics.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No recent activity
                    </h3>
                    <p className="text-gray-600">
                      Activity from your guests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                        </div>
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