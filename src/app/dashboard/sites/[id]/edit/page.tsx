'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Palette,
  Users,
  Heart,
  Clock,
  Search,
  Camera,
  Upload,
  X
} from 'lucide-react'

interface WeddingSite {
  id: string
  subdomain: string
  partner1Name: string
  partner2Name: string
  partner1Email?: string
  partner2Email?: string
  weddingDate: string
  weddingTime?: string
  venueName: string
  venueAddress: string
  venueCity: string
  venueState: string
  venueZip: string
  venueCountry: string
  venueLat?: number
  venueLng?: number
  venueGoogleMapsUrl?: string
  venuePhotos?: string[]
  venuePlaceId?: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  couplePhoto?: string
  rsvpEnabled: boolean
  rsvpDeadline?: string
  giftsEnabled: boolean
  accommodationEnabled: boolean
  transportEnabled: boolean
  guestListEnabled: boolean
  welcomeMessage?: string
  aboutUsStory?: string
  scheduleDetails?: string
  accommodationInfo?: string
  transportInfo?: string
  specialRequests?: string
  paypalEmail?: string
  bankDetails?: string
  giftMessage?: string
}

export default function EditWeddingDetails() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [siteId, setSiteId] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      setSiteId(params.id as string)
    }
  }, [params.id])

  const [site, setSite] = useState<WeddingSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic')

  const [formData, setFormData] = useState<Partial<WeddingSite>>({})
  const [geocoding, setGeocoding] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handleCouplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'couple')

      const response = await fetch(`/api/wedding-sites/${siteId}/upload`, {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, couplePhoto: data.url }))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removeCouplePhoto = () => {
    setFormData(prev => ({ ...prev, couplePhoto: undefined }))
  }

  const lookupVenueLocation = async () => {
    if (!formData.venueName && !formData.venueAddress) {
      alert('Please enter a venue name or address first')
      return
    }

    setGeocoding(true)
    try {
      // Build search query - prioritize venue name for better photo results
      const searchQuery = [
        formData.venueName,
        formData.venueAddress,
        formData.venueCity,
        formData.venueCountry
      ].filter(Boolean).join(', ')

      // Try Google Places API first for photos
      const placesResponse = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}`)

      if (placesResponse.ok) {
        const placesData = await placesResponse.json()

        setFormData(prev => ({
          ...prev,
          venueLat: placesData.lat,
          venueLng: placesData.lng,
          venueGoogleMapsUrl: placesData.googleMapsUrl,
          venuePlaceId: placesData.placeId,
          venuePhotos: placesData.photos || []
        }))

        const photoCount = placesData.photos?.length || 0
        alert(`Location found! ${photoCount} venue photo${photoCount !== 1 ? 's' : ''} loaded.`)
      } else {
        // Fallback to Nominatim geocoding (no photos)
        const fullAddress = [
          formData.venueAddress,
          formData.venueCity,
          formData.venueState,
          formData.venueZip,
          formData.venueCountry
        ].filter(Boolean).join(', ')

        const response = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`)
        const data = await response.json()

        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            venueLat: data.lat,
            venueLng: data.lng,
            venueGoogleMapsUrl: data.googleMapsUrl
          }))
          alert('Location found! (No venue photos available - Google Places API key may not be configured)')
        } else {
          alert(data.error || 'Location not found')
        }
      }
    } catch (error) {
      console.error('Location lookup error:', error)
      alert('Failed to lookup location')
    } finally {
      setGeocoding(false)
    }
  }

  useEffect(() => {
    if (!session || !siteId) {
      if (!session) {
        router.push('/auth/signin')
      }
      return
    }

    fetchSite()
  }, [session, siteId, router])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}`)
      if (response.ok) {
        const siteData = await response.json()
        setSite(siteData)
        setFormData(siteData)
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Wedding details updated successfully!')
        router.push(`/dashboard/sites/${siteId}`)
      } else {
        alert('Error updating wedding details')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error updating wedding details')
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              Edit Wedding Details
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
              Update your wedding information and settings
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: <Heart className="h-4 w-4" /> },
                { id: 'venue', label: 'Venue Details', icon: <MapPin className="h-4 w-4" /> },
                { id: 'content', label: 'Content', icon: <Users className="h-4 w-4" /> },
                { id: 'settings', label: 'Settings', icon: <Palette className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Partner 1 Name *
                    </label>
                    <input
                      type="text"
                      value={formData.partner1Name || ''}
                      onChange={(e) => updateFormData('partner1Name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Partner 2 Name *
                    </label>
                    <input
                      type="text"
                      value={formData.partner2Name || ''}
                      onChange={(e) => updateFormData('partner2Name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Partner 1 Email
                    </label>
                    <input
                      type="email"
                      value={formData.partner1Email || ''}
                      onChange={(e) => updateFormData('partner1Email', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Partner 2 Email
                    </label>
                    <input
                      type="email"
                      value={formData.partner2Email || ''}
                      onChange={(e) => updateFormData('partner2Email', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Wedding Date *
                    </label>
                    <input
                      type="date"
                      value={formData.weddingDate ? formData.weddingDate.split('T')[0] : ''}
                      onChange={(e) => updateFormData('weddingDate', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Wedding Time
                    </label>
                    <input
                      type="time"
                      value={formData.weddingTime || ''}
                      onChange={(e) => updateFormData('weddingTime', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>
                </div>

                {/* Couple Photo Upload */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-pink-500" />
                    Couple Photo
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a photo of you and your partner. This will be displayed prominently on your wedding website.
                  </p>

                  {formData.couplePhoto ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.couplePhoto}
                        alt="Couple photo"
                        className="w-64 h-64 object-cover rounded-lg shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeCouplePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCouplePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-3"></div>
                          <span className="text-sm text-gray-500">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-3" />
                          <span className="text-sm font-medium text-gray-600">Click to upload</span>
                          <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'venue' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={formData.venueName || ''}
                      onChange={(e) => updateFormData('venueName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        value={formData.venueAddress || ''}
                        onChange={(e) => updateFormData('venueAddress', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                        placeholder="Enter venue address"
                      />
                      <button
                        type="button"
                        onClick={lookupVenueLocation}
                        disabled={geocoding || !formData.venueAddress}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Search className="h-4 w-4" />
                        {geocoding ? 'Looking up...' : 'Lookup'}
                      </button>
                    </div>
                    {formData.venueLat && formData.venueLng && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ Location found: {formData.venueLat.toFixed(4)}, {formData.venueLng.toFixed(4)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.venueCity || ''}
                      onChange={(e) => updateFormData('venueCity', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      value={formData.venueState || ''}
                      onChange={(e) => updateFormData('venueState', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.venueZip || ''}
                      onChange={(e) => updateFormData('venueZip', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      value={formData.venueCountry || ''}
                      onChange={(e) => updateFormData('venueCountry', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    >
                      <option value="">Select a country</option>
                      <option value="Spain">Spain</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Italy">Italy</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Austria">Austria</option>
                      <option value="Greece">Greece</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Argentina">Argentina</option>
                      <option value="India">India</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Philippines">Philippines</option>
                      <option value="South Africa">South Africa</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Website Content</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Welcome Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.welcomeMessage || ''}
                    onChange={(e) => updateFormData('welcomeMessage', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="A warm welcome message for your guests..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Our Story
                  </label>
                  <textarea
                    rows={6}
                    value={formData.aboutUsStory || ''}
                    onChange={(e) => updateFormData('aboutUsStory', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="Tell your love story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Accommodation Information
                  </label>
                  <textarea
                    rows={4}
                    value={formData.accommodationInfo || ''}
                    onChange={(e) => updateFormData('accommodationInfo', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="Information about hotels and accommodations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transport Information
                  </label>
                  <textarea
                    rows={4}
                    value={formData.transportInfo || ''}
                    onChange={(e) => updateFormData('transportInfo', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="Transportation and travel information..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gift Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.giftMessage || ''}
                    onChange={(e) => updateFormData('giftMessage', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="A message about gifts for your guests..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Website Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formData.primaryColor || '#d946ef'}
                      onChange={(e) => updateFormData('primaryColor', e.target.value)}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={formData.secondaryColor || '#f97316'}
                      onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      RSVP Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.rsvpDeadline ? formData.rsvpDeadline.split('T')[0] : ''}
                      onChange={(e) => updateFormData('rsvpDeadline', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      PayPal Email (for gifts)
                    </label>
                    <input
                      type="email"
                      value={formData.paypalEmail || ''}
                      onChange={(e) => updateFormData('paypalEmail', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Details (for gifts)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bankDetails || ''}
                    onChange={(e) => updateFormData('bankDetails', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="Bank account details for transfers..."
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Feature Settings</h4>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.rsvpEnabled || false}
                        onChange={(e) => updateFormData('rsvpEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable RSVP functionality</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.giftsEnabled || false}
                        onChange={(e) => updateFormData('giftsEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable gift functionality</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.accommodationEnabled || false}
                        onChange={(e) => updateFormData('accommodationEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show accommodation section</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.transportEnabled || false}
                        onChange={(e) => updateFormData('transportEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Show transport section</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}