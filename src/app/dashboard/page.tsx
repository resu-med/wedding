'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, ExternalLink, Calendar, Users, Gift, BarChart3, LogOut } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name}
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/create"
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Wedding Site</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {weddingSites.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wedding sites</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first wedding website.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Wedding Site
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weddingSites.map((site) => (
              <WeddingSiteCard key={site.id} site={site} />
            ))}
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

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {site.partner1Name} & {site.partner2Name}
          </h3>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/sites/${site.id}`}
              className="text-pink-600 hover:text-pink-500"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <a
              href={`https://${site.subdomain}.localhost:3000`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-500"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Wedding Date:</strong> {formattedDate}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Site URL:</strong> {site.subdomain}.yourwedding.com
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="RSVPs" value="0" />
          <StatCard icon={<Gift className="h-5 w-5" />} label="Gifts" value="0" />
          <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Views" value="0" />
        </div>

        <div className="mt-6">
          <Link
            href={`/dashboard/sites/${site.id}`}
            className="w-full bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
          >
            Manage Site
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center text-gray-400 mb-1">
        {icon}
      </div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}