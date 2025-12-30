'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Users,
  Mail,
  Edit,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  UserPlus,
  Search,
  ExternalLink
} from 'lucide-react'
import { Logo } from '@/components/Logo'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  relationship: string
  invitationSent: boolean
  rsvpStatus: 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'
  dietaryRestrictions?: string
  plusOne: boolean
  plusOneName?: string
  createdAt: string
}

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  subdomain: string
}

export default function GuestManagement() {
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
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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
      const [siteResponse, guestsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/guests`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
      }

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json()
        setGuests(guestsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/guests/${guestId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGuests(guests.filter(g => g.id !== guestId))
      }
    } catch (error) {
      console.error('Error deleting guest:', error)
    }
  }

  const sendInvitations = async () => {
    if (selectedGuests.length === 0) {
      alert('Please select guests to send invitations to.')
      return
    }

    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestIds: selectedGuests }),
      })

      if (response.ok) {
        alert('Invitations sent successfully!')
        fetchData()
        setSelectedGuests([])
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATTENDING': return 'text-green-700 bg-green-100'
      case 'NOT_ATTENDING': return 'text-red-700 bg-red-100'
      case 'PENDING': return 'text-amber-700 bg-amber-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-100 rounded-full mx-auto" />
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading guests...</p>
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
            <div className="flex items-center gap-6">
              <Link href="/" className="flex-shrink-0">
                <Logo size="sm" />
              </Link>
              <Link
                href={`/dashboard/sites/${siteId}`}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </Link>
            </div>
            {site && (
              <a
                href={`https://${site.subdomain}.weddingprepped.com`}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Guest Management</h1>
          {site && (
            <p className="text-gray-600 mt-1">{site.partner1Name} & {site.partner2Name}&apos;s guest list</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Guests</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{guests.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Attending</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{guests.filter(g => g.rsvpStatus === 'ATTENDING').length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Not Attending</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{guests.filter(g => g.rsvpStatus === 'NOT_ATTENDING').length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pending</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Mail className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{guests.filter(g => g.rsvpStatus === 'PENDING').length}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Add Guest
              </button>
              <button
                onClick={sendInvitations}
                disabled={selectedGuests.length === 0}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Mail className="h-4 w-4" />
                Send Invitations ({selectedGuests.length})
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm text-black"
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {guests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No guests yet</h3>
              <p className="text-gray-600 mb-6">Start building your guest list by adding your first guest</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                <UserPlus className="h-5 w-5" />
                Add First Guest
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGuests.length === guests.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGuests(guests.map(g => g.id))
                          } else {
                            setSelectedGuests([])
                          }
                        }}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plus One</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedGuests.includes(guest.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGuests([...selectedGuests, guest.id])
                            } else {
                              setSelectedGuests(selectedGuests.filter(id => id !== guest.id))
                            }
                          }}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white font-medium">
                            {guest.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{guest.name}</div>
                            <div className="text-sm text-gray-500">{guest.relationship}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{guest.email || '-'}</div>
                        <div className="text-sm text-gray-500">{guest.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}>
                          {guest.rsvpStatus === 'ATTENDING' && <Check className="h-3 w-3 mr-1" />}
                          {guest.rsvpStatus === 'NOT_ATTENDING' && <X className="h-3 w-3 mr-1" />}
                          {guest.rsvpStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {guest.plusOne ? (guest.plusOneName || 'Yes') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingGuest(guest)}
                            className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Guest Modal */}
      {(showAddModal || editingGuest) && (
        <GuestModal
          isOpen={true}
          onClose={() => {
            setShowAddModal(false)
            setEditingGuest(null)
          }}
          siteId={siteId}
          guest={editingGuest}
          onSuccess={() => {
            fetchData()
            setShowAddModal(false)
            setEditingGuest(null)
          }}
        />
      )}
    </div>
  )
}

function GuestModal({
  isOpen,
  onClose,
  siteId,
  guest,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  siteId: string
  guest?: Guest | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    relationship: guest?.relationship || '',
    plusOne: guest?.plusOne || false,
    plusOneName: guest?.plusOneName || '',
    dietaryRestrictions: guest?.dietaryRestrictions || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = guest
        ? `/api/wedding-sites/${siteId}/guests/${guest.id}`
        : `/api/wedding-sites/${siteId}/guests`

      const method = guest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving guest:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
              />
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                id="relationship"
                required
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
              >
                <option value="">Select relationship</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Partner's Family">Partner&apos;s Family</option>
                <option value="Partner's Friend">Partner&apos;s Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="plusOne"
              checked={formData.plusOne}
              onChange={(e) => setFormData(prev => ({ ...prev, plusOne: e.target.checked }))}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="plusOne" className="text-sm text-gray-700">
              Allow plus one
            </label>
          </div>

          {formData.plusOne && (
            <div>
              <label htmlFor="plusOneName" className="block text-sm font-medium text-gray-700 mb-2">
                Plus One Name
              </label>
              <input
                type="text"
                id="plusOneName"
                value={formData.plusOneName}
                onChange={(e) => setFormData(prev => ({ ...prev, plusOneName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
              />
            </div>
          )}

          <div>
            <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <textarea
              id="dietaryRestrictions"
              rows={3}
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : (guest ? 'Update Guest' : 'Add Guest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
