'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Hotel,
  MapPin,
  Star,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react'

interface Hotel {
  placeId: string
  name: string
  address: string
  rating: number | null
  totalRatings: number
  priceLevel: number | null
  photo: string | null
  location: {
    lat: number
    lng: number
  }
  website?: string
  phone?: string
  notes?: string
}

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  venueName: string
  venueLat: number | null
  venueLng: number | null
  accommodationInfo: string | null
  accommodationPlaces: Hotel[] | null
}

export default function AccommodationManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [siteId, setSiteId] = useState<string>('')
  const [site, setSite] = useState<WeddingSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchingHotels, setSearchingHotels] = useState(false)
  const [suggestedHotels, setSuggestedHotels] = useState<Hotel[]>([])
  const [selectedHotels, setSelectedHotels] = useState<Hotel[]>([])
  const [accommodationInfo, setAccommodationInfo] = useState('')
  const [searchRadius, setSearchRadius] = useState('5000')
  const [showAddManual, setShowAddManual] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchCoords, setSearchCoords] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [manualHotel, setManualHotel] = useState({
    name: '',
    address: '',
    website: '',
    phone: '',
    notes: ''
  })

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
      const response = await fetch(`/api/wedding-sites/${siteId}`)
      if (response.ok) {
        const data = await response.json()
        setSite(data)
        setSelectedHotels(data.accommodationPlaces || [])
        setAccommodationInfo(data.accommodationInfo || '')
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchForLocation = async () => {
    if (!searchLocation.trim()) {
      alert('Please enter a location to search')
      return
    }

    setSearchingLocation(true)
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchLocation)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.lat && data.lng) {
          setSearchCoords({ lat: data.lat, lng: data.lng, name: searchLocation })
        } else {
          alert('Location not found. Try a different search term.')
        }
      } else {
        alert('Failed to find location')
      }
    } catch (error) {
      console.error('Error searching location:', error)
      alert('Error searching for location')
    } finally {
      setSearchingLocation(false)
    }
  }

  const clearSearchLocation = () => {
    setSearchCoords(null)
    setSearchLocation('')
    setSuggestedHotels([])
  }

  const searchNearbyHotels = async () => {
    // Use custom search location if set, otherwise use venue
    const lat = searchCoords?.lat || site?.venueLat
    const lng = searchCoords?.lng || site?.venueLng

    if (!lat || !lng) {
      alert('Please enter a location to search or set your venue location')
      return
    }

    setSearchingHotels(true)
    try {
      const response = await fetch(
        `/api/places/hotels?lat=${lat}&lng=${lng}&radius=${searchRadius}`
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestedHotels(data.hotels || [])
      } else {
        alert('Failed to search for hotels')
      }
    } catch (error) {
      console.error('Error searching hotels:', error)
      alert('Error searching for hotels')
    } finally {
      setSearchingHotels(false)
    }
  }

  const addHotel = (hotel: Hotel) => {
    if (!selectedHotels.find(h => h.placeId === hotel.placeId)) {
      setSelectedHotels([...selectedHotels, hotel])
    }
  }

  const removeHotel = (placeId: string) => {
    setSelectedHotels(selectedHotels.filter(h => h.placeId !== placeId))
  }

  const addManualHotel = () => {
    if (!manualHotel.name) {
      alert('Please enter a hotel name')
      return
    }

    const newHotel: Hotel = {
      placeId: `manual-${Date.now()}`,
      name: manualHotel.name,
      address: manualHotel.address,
      rating: null,
      totalRatings: 0,
      priceLevel: null,
      photo: null,
      location: { lat: 0, lng: 0 },
      website: manualHotel.website,
      phone: manualHotel.phone,
      notes: manualHotel.notes
    }

    setSelectedHotels([...selectedHotels, newHotel])
    setManualHotel({ name: '', address: '', website: '', phone: '', notes: '' })
    setShowAddManual(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationPlaces: selectedHotels,
          accommodationInfo: accommodationInfo
        })
      })

      if (response.ok) {
        alert('Accommodation details saved successfully!')
      } else {
        alert('Failed to save accommodation details')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving accommodation details')
    } finally {
      setSaving(false)
    }
  }

  const getPriceLevelText = (level: number | null) => {
    if (level === null) return ''
    return '$'.repeat(level) || 'Budget'
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
                Back to Site
              </Link>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Accommodation & Places to Stay
            </h1>
            <p className="text-gray-600">
              Help your guests find places to stay near {site.venueName}
            </p>
          </div>
        )}

        {/* General Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Accommodation Information</h2>
          <textarea
            rows={4}
            value={accommodationInfo}
            onChange={(e) => setAccommodationInfo(e.target.value)}
            placeholder="Add any general information about accommodation for your guests... (e.g., 'We recommend booking early as June is a busy season in the area')"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
          />
        </div>

        {/* Search for Hotels */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Nearby Hotels</h2>

          {/* Location Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Location</label>
            <p className="text-sm text-gray-500 mb-3">
              Enter a city, town, or area to search for hotels. Leave blank to search near your venue.
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchForLocation()}
                placeholder="e.g., Barcelona, Spain or Sitges"
                className="flex-1 min-w-[250px] px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-pink-500 focus:border-pink-500"
              />
              <button
                onClick={searchForLocation}
                disabled={searchingLocation || !searchLocation.trim()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {searchingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{searchingLocation ? 'Finding...' : 'Set Location'}</span>
              </button>
            </div>

            {/* Show selected search location */}
            {searchCoords && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Searching near: <strong>{searchCoords.name}</strong>
                  </span>
                </div>
                <button
                  onClick={clearSearchLocation}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            {!searchCoords && site?.venueLat && site?.venueLng && (
              <p className="mt-2 text-sm text-gray-500">
                Currently searching near venue: {site.venueName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="2000">2 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="20000">20 km</option>
                <option value="50000">50 km</option>
              </select>
            </div>
            <button
              onClick={searchNearbyHotels}
              disabled={searchingHotels || (!searchCoords && !site?.venueLat)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {searchingHotels ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>{searchingHotels ? 'Searching...' : 'Search Hotels'}</span>
            </button>
          </div>

          {suggestedHotels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Found {suggestedHotels.length} hotels {searchCoords ? `near ${searchCoords.name}` : 'nearby'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {suggestedHotels.map((hotel) => (
                  <div
                    key={hotel.placeId}
                    className={`border rounded-lg p-4 ${
                      selectedHotels.find(h => h.placeId === hotel.placeId)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {hotel.photo && (
                      <img
                        src={hotel.photo}
                        alt={hotel.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h4 className="font-medium text-gray-900 text-sm">{hotel.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{hotel.address}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      {hotel.rating && (
                        <div className="flex items-center text-xs">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span>{hotel.rating}</span>
                          <span className="text-gray-400 ml-1">({hotel.totalRatings})</span>
                        </div>
                      )}
                      {hotel.priceLevel && (
                        <span className="text-xs text-green-600">{getPriceLevelText(hotel.priceLevel)}</span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        selectedHotels.find(h => h.placeId === hotel.placeId)
                          ? removeHotel(hotel.placeId)
                          : addHotel(hotel)
                      }
                      className={`mt-3 w-full py-1 px-2 rounded text-xs font-medium ${
                        selectedHotels.find(h => h.placeId === hotel.placeId)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      {selectedHotels.find(h => h.placeId === hotel.placeId) ? 'Remove' : 'Add to List'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Hotels */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Recommended Places ({selectedHotels.length})
            </h2>
            <button
              onClick={() => setShowAddManual(true)}
              className="text-pink-600 hover:text-pink-700 flex items-center space-x-1 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Manually</span>
            </button>
          </div>

          {selectedHotels.length === 0 ? (
            <div className="text-center py-12">
              <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No places added yet</p>
              <p className="text-sm text-gray-500">Search for hotels above or add them manually</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedHotels.map((hotel, index) => (
                <div
                  key={hotel.placeId}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 rounded-full p-2">
                      <Hotel className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{hotel.name}</h3>
                      {hotel.address && (
                        <p className="text-sm text-gray-500 mt-1">{hotel.address}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-3 text-sm">
                        {hotel.rating && (
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-4 w-4 mr-1" />
                            {hotel.rating}
                          </div>
                        )}
                        {hotel.website && (
                          <a
                            href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        )}
                        {hotel.phone && (
                          <span className="text-gray-600">{hotel.phone}</span>
                        )}
                      </div>
                      {hotel.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{hotel.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeHotel(hotel.placeId)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Manual Hotel Modal */}
        {showAddManual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Place Manually</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={manualHotel.name}
                    onChange={(e) => setManualHotel({ ...manualHotel, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="Hotel name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={manualHotel.address}
                    onChange={(e) => setManualHotel({ ...manualHotel, address: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="text"
                    value={manualHotel.website}
                    onChange={(e) => setManualHotel({ ...manualHotel, website: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={manualHotel.phone}
                    onChange={(e) => setManualHotel({ ...manualHotel, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes for Guests</label>
                  <textarea
                    value={manualHotel.notes}
                    onChange={(e) => setManualHotel({ ...manualHotel, notes: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="e.g., 'Ask for the wedding rate'"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddManual(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addManualHotel}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  Add Place
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
