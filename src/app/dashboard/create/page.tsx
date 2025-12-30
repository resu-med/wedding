'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Calendar, MapPin, Palette, Globe, Search, CreditCard, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { generateSubdomain, isValidSubdomain, getCurrencyForCountry } from '@/lib/utils'

export default function CreateWeddingSite() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessStatus, setAccessStatus] = useState<{
    hasPaid: boolean
    hasSite: boolean
    siteId?: string
  } | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [subdomainSuggestions, setSubdomainSuggestions] = useState<string[]>([])
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)

  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    partner1Email: '',
    weddingDate: '',
    weddingTime: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    venueCountry: '',
    venueLat: null as number | null,
    venueLng: null as number | null,
    venueGoogleMapsUrl: '',
    venuePlaceId: '',
    venuePhotos: [] as string[],
    subdomain: '',
    primaryColor: '#d946ef',
    secondaryColor: '#f3f4f6',
    welcomeMessage: '',
    aboutUsStory: '',
    giftCurrency: 'USD'
  })

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch('/api/user/access')
        if (response.ok) {
          const data = await response.json()
          setAccessStatus(data)
        }
      } catch (error) {
        console.error('Error checking access:', error)
      } finally {
        setCheckingAccess(false)
      }
    }
    checkAccess()
  }, [])

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
      setSubdomainStatus('idle')
      setSubdomainSuggestions([])
      return
    }

    if (!isValidSubdomain(formData.subdomain)) {
      setSubdomainStatus('idle')
      return
    }

    setSubdomainStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/wedding-sites/check-subdomain?subdomain=${formData.subdomain}`)
        const data = await response.json()

        if (data.available) {
          setSubdomainStatus('available')
          setSubdomainSuggestions([])
        } else {
          setSubdomainStatus('taken')
          // Generate suggestions
          const year = formData.weddingDate ? new Date(formData.weddingDate).getFullYear() : 2025
          setSubdomainSuggestions([
            `${formData.subdomain}${year}`,
            `${formData.subdomain}wedding`,
            `the${formData.subdomain}`,
          ])
        }
      } catch (error) {
        setSubdomainStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.subdomain, formData.weddingDate])

  const handlePayment = async () => {
    setProcessingPayment(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
        setProcessingPayment(false)
      }
    } catch (error) {
      setError('Failed to start checkout')
      setProcessingPayment(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-generate subdomain when partner names change
      if (name === 'partner1Name' || name === 'partner2Name') {
        if (updated.partner1Name && updated.partner2Name) {
          updated.subdomain = generateSubdomain(updated.partner1Name, updated.partner2Name)
        }
      }

      // Auto-set currency when country changes
      if (name === 'venueCountry') {
        updated.giftCurrency = getCurrencyForCountry(value)
      }

      return updated
    })
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
          alert('Location found! (No venue photos available)')
        } else {
          alert(data.error || 'Failed to lookup location')
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Failed to lookup location')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isValidSubdomain(formData.subdomain)) {
      setError('Please enter a valid subdomain (3+ characters, letters and numbers only)')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/wedding-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/sites/${data.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'An error occurred')
        // Show suggestions if subdomain is taken
        if (data.suggestions) {
          setSubdomainSuggestions(data.suggestions)
        } else {
          setSubdomainSuggestions([])
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  // Show payment gate if user hasn't paid
  if (accessStatus && !accessStatus.hasPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CreditCard className="h-16 w-16 text-pink-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Wedding Website
            </h1>
            <p className="text-gray-600 mb-6">
              For just £79, get a beautiful, personalized wedding website with all the features you need.
            </p>

            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Beautiful, customizable wedding website
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  RSVP management & guest tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Gift registry & contributions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Interactive venue maps
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Email notifications for RSVPs & gifts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited access until your wedding day
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {processingPayment ? 'Redirecting to checkout...' : 'Get Started for £79'}
            </button>

            <Link
              href="/dashboard"
              className="block mt-4 text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show message if user already has a wedding site
  if (accessStatus && accessStatus.hasSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Site Limit Reached
            </h1>
            <p className="text-gray-600 mb-6">
              Your account already has a wedding site. Each account is limited to one wedding site.
            </p>

            <div className="space-y-3">
              <Link
                href={`/dashboard/sites/${accessStatus.siteId}`}
                className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Go to Your Wedding Site
              </Link>
              <Link
                href="/dashboard"
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">Create Your Wedding Site</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <p>{error}</p>
              {subdomainSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-2">Choose an available URL:</p>
                  <div className="flex flex-wrap gap-2">
                    {subdomainSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, subdomain: suggestion }))
                          setError('')
                          setSubdomainSuggestions([])
                        }}
                        className="px-3 py-1 bg-white border border-pink-300 text-pink-600 rounded-full text-sm hover:bg-pink-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Couple Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Heart className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Couple Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="partner1Name" className="block text-sm font-medium text-gray-700">
                  Partner 1 Name *
                </label>
                <input
                  type="text"
                  id="partner1Name"
                  name="partner1Name"
                  required
                  value={formData.partner1Name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>

              <div>
                <label htmlFor="partner2Name" className="block text-sm font-medium text-gray-700">
                  Partner 2 Name *
                </label>
                <input
                  type="text"
                  id="partner2Name"
                  name="partner2Name"
                  required
                  value={formData.partner2Name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="partner1Email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="partner1Email"
                  name="partner1Email"
                  value={formData.partner1Email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Wedding Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Wedding Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700">
                  Wedding Date *
                </label>
                <input
                  type="date"
                  id="weddingDate"
                  name="weddingDate"
                  required
                  value={formData.weddingDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>

              <div>
                <label htmlFor="weddingTime" className="block text-sm font-medium text-gray-700">
                  Wedding Time
                </label>
                <input
                  type="time"
                  id="weddingTime"
                  name="weddingTime"
                  value={formData.weddingTime}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Venue Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                  Venue Name *
                </label>
                <input
                  type="text"
                  id="venueName"
                  name="venueName"
                  required
                  value={formData.venueName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>

              <div>
                <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  id="venueAddress"
                  name="venueAddress"
                  required
                  value={formData.venueAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="venueCity" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="venueCity"
                    name="venueCity"
                    required
                    value={formData.venueCity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="venueState" className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="venueState"
                    name="venueState"
                    value={formData.venueState}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="venueZip" className="block text-sm font-medium text-gray-700">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    id="venueZip"
                    name="venueZip"
                    required
                    value={formData.venueZip}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venueCountry" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="venueCountry"
                  name="venueCountry"
                  required
                  value={formData.venueCountry}
                  onChange={handleChange}
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

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Venue Location</h3>
                  <button
                    type="button"
                    onClick={lookupVenueLocation}
                    disabled={geocoding || !formData.venueAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {geocoding ? 'Looking up...' : 'Lookup Location'}
                  </button>
                </div>

                {formData.venueLat && formData.venueLng ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-700">
                      ✓ Location found: {formData.venueLat.toFixed(6)}, {formData.venueLng.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      This will allow guests to see the venue location on a map
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-sm text-gray-600">
                      Enter the venue address above and click &quot;Lookup Location&quot; to enable map features for your guests
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Website Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Website Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                  Website URL *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    required
                    value={formData.subdomain}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-l-md focus:outline-none text-black ${
                      subdomainStatus === 'available'
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : subdomainStatus === 'taken'
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="your-names"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                    .weddingprepped.com
                  </span>
                  {subdomainStatus === 'checking' && (
                    <span className="inline-flex items-center px-2">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </span>
                  )}
                  {subdomainStatus === 'available' && (
                    <span className="inline-flex items-center px-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </span>
                  )}
                  {subdomainStatus === 'taken' && (
                    <span className="inline-flex items-center px-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </span>
                  )}
                </div>

                {subdomainStatus === 'available' && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    This URL is available!
                  </p>
                )}

                {subdomainStatus === 'taken' && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 flex items-center mb-2">
                      <XCircle className="h-4 w-4 mr-1" />
                      This URL is taken. Try one of these:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subdomainSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, subdomain: suggestion }))
                          }}
                          className="px-3 py-1 bg-white border border-pink-300 text-pink-600 rounded-full text-sm hover:bg-pink-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {subdomainStatus === 'idle' && (
                  <p className="mt-1 text-sm text-gray-500">
                    This will be your wedding website URL that guests will visit
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      name="primaryColor"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      name="secondaryColor"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Palette className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Content</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  rows={3}
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  placeholder="Welcome to our wedding celebration..."
                />
              </div>

              <div>
                <label htmlFor="aboutUsStory" className="block text-sm font-medium text-gray-700">
                  Our Story
                </label>
                <textarea
                  id="aboutUsStory"
                  name="aboutUsStory"
                  rows={4}
                  value={formData.aboutUsStory}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  placeholder="Tell your love story..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Wedding Site...' : 'Create Wedding Site'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}