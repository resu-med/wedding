'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Calendar, MapPin, Palette, Globe } from 'lucide-react'
import { generateSubdomain, isValidSubdomain } from '@/lib/utils'

export default function CreateWeddingSite() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    partner1Email: '',
    partner2Email: '',
    weddingDate: '',
    weddingTime: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    venueCountry: 'United States',
    subdomain: '',
    primaryColor: '#d946ef',
    secondaryColor: '#f3f4f6',
    welcomeMessage: '',
    aboutUsStory: ''
  })

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

      return updated
    })
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
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
              {error}
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

              <div>
                <label htmlFor="partner1Email" className="block text-sm font-medium text-gray-700">
                  Partner 1 Email
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

              <div>
                <label htmlFor="partner2Email" className="block text-sm font-medium text-gray-700">
                  Partner 2 Email
                </label>
                <input
                  type="email"
                  id="partner2Email"
                  name="partner2Email"
                  value={formData.partner2Email}
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
                    State *
                  </label>
                  <input
                    type="text"
                    id="venueState"
                    name="venueState"
                    required
                    value={formData.venueState}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="venueZip" className="block text-sm font-medium text-gray-700">
                    ZIP Code *
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                    placeholder="your-names"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                    .yourwedding.com
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  This will be your wedding website URL that guests will visit
                </p>
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