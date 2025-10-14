'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  MessageCircle,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  Send
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  publishAt: string
  expiresAt?: string
  createdAt: string
}

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
}

export default function AnnouncementManagement() {
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

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
      const [siteResponse, announcementsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/announcements`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
      }

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json()
        setAnnouncements(announcementsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/announcements/${announcementId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== announcementId))
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'NORMAL': return 'text-blue-600 bg-blue-100'
      case 'LOW': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
            <h1 className="text-2xl font-bold text-gray-900">
              Guest Communication
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {site.partner1Name} & {site.partner2Name}
            </h2>
            <p className="text-gray-600">
              Send announcements and updates to your wedding guests
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Announcement</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {announcements.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No announcements yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first announcement to communicate with your guests
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                >
                  Create Announcement
                </button>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {announcement.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}
                        >
                          {announcement.priority}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-line">
                        {announcement.content}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Published: {new Date(announcement.publishAt).toLocaleDateString()}
                        </div>
                        {announcement.expiresAt && (
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAnnouncement) && (
        <AnnouncementModal
          isOpen={true}
          onClose={() => {
            setShowCreateModal(false)
            setEditingAnnouncement(null)
          }}
          siteId={siteId}
          announcement={editingAnnouncement}
          onSuccess={() => {
            fetchData()
            setShowCreateModal(false)
            setEditingAnnouncement(null)
          }}
        />
      )}
    </div>
  )
}

function AnnouncementModal({
  isOpen,
  onClose,
  siteId,
  announcement,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  siteId: string
  announcement?: Announcement | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'NORMAL',
    publishAt: announcement ? announcement.publishAt.split('T')[0] : new Date().toISOString().split('T')[0],
    expiresAt: announcement?.expiresAt ? announcement.expiresAt.split('T')[0] : ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = announcement
        ? `/api/wedding-sites/${siteId}/announcements/${announcement.id}`
        : `/api/wedding-sites/${siteId}/announcements`

      const method = announcement ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          publishAt: new Date(formData.publishAt).toISOString(),
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving announcement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="content"
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="publishAt" className="block text-sm font-medium text-gray-700">
                Publish Date
              </label>
              <input
                type="date"
                id="publishAt"
                value={formData.publishAt}
                onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                Expires Date
              </label>
              <input
                type="date"
                id="expiresAt"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (announcement ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}