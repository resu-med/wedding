'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Heart, Calendar, MapPin, Gift, Users, Camera, MessageCircle, Clock } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import RSVPModal from '@/components/RSVPModal'
import GiftModal from '@/components/GiftModal'
import VenueMap from '@/components/VenueMap'
import VenuePhotoCarousel from '@/components/VenuePhotoCarousel'

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
  heroImage?: string
  galleryImages: string[]
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
  bankName?: string
  bankAccountName?: string
  bankIban?: string
  bankBic?: string
  bankReference?: string
  giftMessage?: string
  giftCurrency?: string
  createdAt: string
  updatedAt: string
}

export default function PublicWeddingSite() {
  const params = useParams()
  const [subdomain, setSubdomain] = useState<string>('')
  const [site, setSite] = useState<WeddingSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)

  useEffect(() => {
    if (params.subdomain) {
      setSubdomain(params.subdomain as string)
    }
  }, [params.subdomain])

  useEffect(() => {
    if (subdomain) {
      fetchSite()
    }
  }, [subdomain])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/public/sites/${subdomain}`)
      if (response.ok) {
        const siteData = await response.json()
        setSite(siteData)
      } else {
        setError('Wedding site not found')
      }
    } catch (error) {
      setError('Error loading wedding site')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading wedding details...</p>
        </div>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wedding Site Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const weddingDate = new Date(site.weddingDate)
  const isUpcoming = weddingDate > new Date()
  const daysUntil = Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${site.primaryColor}10, ${site.secondaryColor}30)`
      }}
    >
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6" style={{ color: site.primaryColor }} />
              <span className="font-bold text-lg text-gray-900">
                {site.partner1Name} & {site.partner2Name}
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
              <a href="#details" className="text-gray-700 hover:text-gray-900 font-medium">Details</a>
              {site.rsvpEnabled && (
                <a href="#rsvp" className="text-gray-700 hover:text-gray-900 font-medium">RSVP</a>
              )}
              {site.accommodationEnabled && (
                <a href="#accommodation" className="text-gray-700 hover:text-gray-900 font-medium">Stay</a>
              )}
              {site.transportEnabled && (
                <a href="#transport" className="text-gray-700 hover:text-gray-900 font-medium">Travel</a>
              )}
              {site.giftsEnabled && (
                <a href="#gifts" className="text-gray-700 hover:text-gray-900 font-medium">Gifts</a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Heart className="h-20 w-20 mx-auto mb-6" style={{ color: site.primaryColor }} />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
              {site.partner1Name}
              <span className="text-gray-600 mx-4">&</span>
              {site.partner2Name}
            </h1>
            <div className="text-xl md:text-2xl text-gray-700 mb-6">
              {formatDate(weddingDate)}
              {site.weddingTime && (
                <span className="block mt-2 text-lg">
                  {formatTime(site.weddingTime)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center text-gray-600 mb-8">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{site.venueName}, {site.venueCity}, {site.venueState}</span>
            </div>

            {isUpcoming && daysUntil > 0 && (
              <div className="bg-white/80 rounded-lg p-6 mb-8 inline-block">
                <div className="text-3xl font-bold" style={{ color: site.primaryColor }}>
                  {daysUntil}
                </div>
                <div className="text-gray-600">
                  {daysUntil === 1 ? 'day' : 'days'} to go!
                </div>
              </div>
            )}

            {site.welcomeMessage && (
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                {site.welcomeMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      {site.aboutUsStory && (
        <section className="py-16 bg-white/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-700">
              <p className="whitespace-pre-line">{site.aboutUsStory}</p>
            </div>
          </div>
        </section>
      )}

      {/* Wedding Details */}
      <section id="details" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Wedding Details</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Ceremony */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4" style={{ color: site.primaryColor }} />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ceremony</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(weddingDate)}
                </div>
                {site.weddingTime && (
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(site.weddingTime)}
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <div>
                    <div>{site.venueName}</div>
                    <div className="text-sm">{site.venueAddress}</div>
                    <div className="text-sm">{site.venueCity}, {site.venueState} {site.venueZip}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reception */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4" style={{ color: site.primaryColor }} />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reception</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(weddingDate)}
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Following ceremony
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <div>
                    <div>{site.venueName}</div>
                    <div className="text-sm">{site.venueAddress}</div>
                    <div className="text-sm">{site.venueCity}, {site.venueState} {site.venueZip}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Photos Carousel */}
      {site.venuePhotos && site.venuePhotos.length > 0 && (
        <div className="bg-white/50">
          <VenuePhotoCarousel
            photos={site.venuePhotos}
            venueName={site.venueName}
            primaryColor={site.primaryColor}
          />
        </div>
      )}

      {/* Venue Map Section */}
      {site.venueLat && site.venueLng && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find Us</h2>
            <VenueMap
              lat={site.venueLat}
              lng={site.venueLng}
              venueName={site.venueName}
              venueAddress={`${site.venueAddress}, ${site.venueCity}, ${site.venueState} ${site.venueZip}`}
              googleMapsUrl={site.venueGoogleMapsUrl}
            />
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {site.rsvpEnabled && (
        <section id="rsvp" className="py-16 bg-white/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">RSVP</h2>
            {site.rsvpDeadline && (
              <p className="text-lg text-gray-700 mb-8">
                Please respond by {formatDate(new Date(site.rsvpDeadline))}
              </p>
            )}
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <button
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: site.primaryColor }}
                onClick={() => setShowRSVPModal(true)}
              >
                RSVP Now
              </button>
              <p className="text-sm text-gray-600 mt-4">
                Click to submit your response
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Accommodation Section */}
      {site.accommodationEnabled && site.accommodationInfo && (
        <section id="accommodation" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Accommodation</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-lg mx-auto text-gray-700">
                <p className="whitespace-pre-line">{site.accommodationInfo}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Transport Section */}
      {site.transportEnabled && site.transportInfo && (
        <section id="transport" className="py-16 bg-white/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Travel Information</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-lg mx-auto text-gray-700">
                <p className="whitespace-pre-line">{site.transportInfo}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gifts Section */}
      {site.giftsEnabled && (
        <section id="gifts" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Wedding Gifts</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <Gift className="h-12 w-12 mx-auto mb-4" style={{ color: site.primaryColor }} />
              <p className="text-gray-700 mb-6">
                Your presence is the only present we need, but if you&apos;d like to contribute to our future together, we&apos;d be grateful.
              </p>
              <button
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-3"
                style={{ backgroundColor: site.primaryColor }}
                onClick={() => setShowGiftModal(true)}
              >
                Send a Gift
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white/80 py-8 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 mr-2" style={{ color: site.primaryColor }} />
            <span className="text-lg font-semibold text-gray-900">
              {site.partner1Name} & {site.partner2Name}
            </span>
          </div>
          <p className="text-gray-600">
            {formatDate(weddingDate)} • {site.venueCity}, {site.venueState}
          </p>
        </div>
      </footer>

      {/* Modals */}
      {site.rsvpEnabled && (
        <RSVPModal
          isOpen={showRSVPModal}
          onClose={() => setShowRSVPModal(false)}
          siteId={site.id}
          primaryColor={site.primaryColor}
          partner1Name={site.partner1Name}
          partner2Name={site.partner2Name}
        />
      )}

      {site.giftsEnabled && (
        <GiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          siteId={site.id}
          primaryColor={site.primaryColor}
          partner1Name={site.partner1Name}
          partner2Name={site.partner2Name}
          paypalEmail={site.paypalEmail}
          giftMessage={site.giftMessage}
          giftCurrency={site.giftCurrency}
          bankName={site.bankName}
          bankAccountName={site.bankAccountName}
          bankIban={site.bankIban}
          bankBic={site.bankBic}
          bankReference={site.bankReference}
        />
      )}
    </div>
  )
}