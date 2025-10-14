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
  UserPlus
} from 'lucide-react'

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
      case 'ATTENDING': return 'text-green-600 bg-green-100'
      case 'NOT_ATTENDING': return 'text-red-600 bg-red-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATTENDING': return <Check className="h-4 w-4" />
      case 'NOT_ATTENDING': return <X className="h-4 w-4" />
      default: return null
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
              Guest Management
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
              Manage your guest list, send invitations, and track RSVPs
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-semibold text-gray-900">{guests.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attending</p>
                <p className="text-2xl font-semibold text-green-600">
                  {guests.filter(g => g.rsvpStatus === 'ATTENDING').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Attending</p>
                <p className="text-2xl font-semibold text-red-600">
                  {guests.filter(g => g.rsvpStatus === 'NOT_ATTENDING').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {guests.filter(g => g.rsvpStatus === 'PENDING').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Guest</span>
              </button>
              <button
                onClick={sendInvitations}
                disabled={selectedGuests.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Invitations ({selectedGuests.length})</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import CSV</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guest List</h3>
          </div>

          <div className="overflow-x-auto">
            {guests.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No guests yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your guest list by adding your first guest
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                >
                  Add First Guest
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plus One
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          {guest.invitationSent && (
                            <div className="text-xs text-green-600">Invitation sent</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{guest.email}</div>
                        <div className="text-sm text-gray-500">{guest.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.relationship}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}>
                          {getStatusIcon(guest.rsvpStatus)}
                          <span className="ml-1">{guest.rsvpStatus.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.plusOne ? (guest.plusOneName || 'Yes') : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingGuest(guest)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                Relationship *
              </label>
              <select
                id="relationship"
                required
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              >
                <option value="">Select relationship</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Partner's Family">Partner's Family</option>
                <option value="Partner's Friend">Partner's Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="plusOne"
              checked={formData.plusOne}
              onChange={(e) => setFormData(prev => ({ ...prev, plusOne: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="plusOne" className="ml-2 text-sm text-gray-700">
              Allow plus one
            </label>
          </div>

          {formData.plusOne && (
            <div>
              <label htmlFor="plusOneName" className="block text-sm font-medium text-gray-700">
                Plus One Name
              </label>
              <input
                type="text"
                id="plusOneName"
                value={formData.plusOneName}
                onChange={(e) => setFormData(prev => ({ ...prev, plusOneName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              />
            </div>
          )}

          <div>
            <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700">
              Dietary Restrictions
            </label>
            <textarea
              id="dietaryRestrictions"
              rows={3}
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
            />
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
              {loading ? 'Saving...' : (guest ? 'Update' : 'Add Guest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}