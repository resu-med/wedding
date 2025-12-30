'use client'

import { useState } from 'react'
import { X, Heart, Users, Check, Plus, Minus, User, Bus } from 'lucide-react'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  siteId: string
  primaryColor: string
  partner1Name: string
  partner2Name: string
}

interface GuestInfo {
  name: string
  dietaryRequests: string
}

export default function RSVPModal({
  isOpen,
  onClose,
  siteId,
  primaryColor,
  partner1Name,
  partner2Name
}: RSVPModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [partySize, setPartySize] = useState(1)
  const [guests, setGuests] = useState<GuestInfo[]>([{ name: '', dietaryRequests: '' }])
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    rsvpStatus: '',
    attendingCeremony: true,
    attendingReception: true,
    needsBusToVenue: false,
    needsBusFromVenue: false,
    specialRequests: '',
    message: ''
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePartySizeChange = (newSize: number) => {
    const clampedSize = Math.min(8, Math.max(1, newSize))
    setPartySize(clampedSize)

    // Adjust guests array
    if (clampedSize > guests.length) {
      const newGuests = [...guests]
      for (let i = guests.length; i < clampedSize; i++) {
        newGuests.push({ name: '', dietaryRequests: '' })
      }
      setGuests(newGuests)
    } else if (clampedSize < guests.length) {
      setGuests(guests.slice(0, clampedSize))
    }
  }

  const handleGuestChange = (index: number, field: keyof GuestInfo, value: string) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guests: guests.map((guest, index) => ({
            name: guest.name,
            dietaryRequests: guest.dietaryRequests,
            isMainGuest: index === 0
          })),
          email: formData.email,
          phone: formData.phone,
          rsvpStatus: formData.rsvpStatus,
          attendingCeremony: formData.attendingCeremony,
          attendingReception: formData.attendingReception,
          needsBusToVenue: formData.needsBusToVenue,
          needsBusFromVenue: formData.needsBusFromVenue,
          specialRequests: formData.specialRequests,
          message: formData.message,
          siteId
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('Error submitting RSVP. Please try again.')
      }
    } catch (error) {
      alert('Error submitting RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const canProceedFromStep1 = partySize >= 1
  const canProceedFromStep2 = guests[0]?.name && formData.email
  const canProceedFromStep3 = guests.every(g => g.name.trim() !== '')
  const canProceedFromStep4 = formData.rsvpStatus !== ''

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Check className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your RSVP for {partySize} {partySize === 1 ? 'guest' : 'guests'} has been submitted successfully.
              {partner1Name} and {partner2Name} appreciate your response!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6" style={{ color: primaryColor }} />
              <h2 className="text-2xl font-bold text-gray-900">RSVP</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-2 rounded-full ${
                    step >= num ? 'bg-opacity-100' : 'bg-gray-200'
                  }`}
                  style={{ backgroundColor: step >= num ? primaryColor : undefined }}
                />
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Party Size */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">How many guests?</h3>
                <p className="text-gray-600">Select the number of people in your party</p>
              </div>

              <div className="flex items-center justify-center space-x-6">
                <button
                  type="button"
                  onClick={() => handlePartySizeChange(partySize - 1)}
                  disabled={partySize <= 1}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  <Minus className="h-5 w-5 text-gray-600" />
                </button>

                <div className="text-center">
                  <div
                    className="text-5xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {partySize}
                  </div>
                  <div className="text-gray-600">
                    {partySize === 1 ? 'Guest' : 'Guests'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePartySizeChange(partySize + 1)}
                  disabled={partySize >= 8}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                >
                  <Plus className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Quick select buttons */}
              <div className="flex justify-center flex-wrap gap-2 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePartySizeChange(num)}
                    className={`w-10 h-10 rounded-full font-semibold transition-all ${
                      partySize === num
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ backgroundColor: partySize === num ? primaryColor : undefined }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep1}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Lead Guest Contact Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Your Contact Information</h3>
                <p className="text-gray-600">Please provide your details</p>
              </div>

              <div>
                <label htmlFor="leadName" className="block text-sm font-medium text-gray-700">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="leadName"
                  required
                  value={guests[0]?.name || ''}
                  onChange={(e) => handleGuestChange(0, 'name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 px-6 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep2}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: All Guest Names & Dietary Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Guest Details</h3>
                <p className="text-gray-600">
                  {partySize === 1
                    ? 'Please confirm your dietary requirements'
                    : `Please provide details for all ${partySize} guests`}
                </p>
              </div>

              <div className="space-y-4">
                {guests.map((guest, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <User className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="font-medium text-gray-900">
                        Guest {index + 1} {index === 0 && '(You)'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {index === 0 ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={guest.name}
                            readOnly
                            className="block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={guest.name}
                            onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                            placeholder="Enter guest name"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dietary Requirements / Allergies
                        </label>
                        <input
                          type="text"
                          value={guest.dietaryRequests}
                          onChange={(e) => handleGuestChange(index, 'dietaryRequests', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                          placeholder="e.g., Vegetarian, Nut allergy, Gluten-free"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 px-6 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep3}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Attendance */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Attendance</h3>
                <p className="text-gray-600">
                  Will {partySize === 1 ? 'you' : 'your party'} be attending the wedding?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  RSVP Status *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'ATTENDING', label: 'Joyfully Accept', emoji: '🎉' },
                    { value: 'NOT_ATTENDING', label: 'Regretfully Decline', emoji: '😢' },
                    { value: 'MAYBE', label: 'Tentative', emoji: '🤔' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.rsvpStatus === option.value
                          ? 'border-opacity-100 bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: formData.rsvpStatus === option.value ? primaryColor : undefined,
                        backgroundColor: formData.rsvpStatus === option.value ? `${primaryColor}10` : undefined
                      }}
                    >
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value={option.value}
                        checked={formData.rsvpStatus === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="ml-3 text-xl">{option.emoji}</span>
                      <span className="ml-2 text-gray-700 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.rsvpStatus === 'ATTENDING' && (
                <>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Which events will you attend?</p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="attendingCeremony"
                        name="attendingCeremony"
                        checked={formData.attendingCeremony}
                        onChange={handleChange}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="attendingCeremony" className="ml-3 text-gray-700">
                        Ceremony
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="attendingReception"
                        name="attendingReception"
                        checked={formData.attendingReception}
                        onChange={handleChange}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="attendingReception" className="ml-3 text-gray-700">
                        Reception
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="h-5 w-5" style={{ color: primaryColor }} />
                      <p className="text-sm font-medium text-gray-700">Bus Transfer</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Do you need bus transport to or from the venue?</p>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needsBusToVenue"
                        name="needsBusToVenue"
                        checked={formData.needsBusToVenue}
                        onChange={handleChange}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="needsBusToVenue" className="ml-3 text-gray-700">
                        Bus to venue
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needsBusFromVenue"
                        name="needsBusFromVenue"
                        checked={formData.needsBusFromVenue}
                        onChange={handleChange}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="needsBusFromVenue" className="ml-3 text-gray-700">
                        Bus from venue
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 px-6 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep4}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Additional Details */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Almost Done!</h3>
                <p className="text-gray-600">Any final details to share?</p>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">RSVP Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Party Size:</strong> {partySize} {partySize === 1 ? 'guest' : 'guests'}</p>
                  <p><strong>Status:</strong> {formData.rsvpStatus === 'ATTENDING' ? 'Attending' : formData.rsvpStatus === 'NOT_ATTENDING' ? 'Not Attending' : 'Maybe'}</p>
                  <p><strong>Guests:</strong> {guests.map(g => g.name).join(', ')}</p>
                </div>
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                  Special Requests or Accessibility Needs
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows={2}
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  placeholder="Wheelchair access, childcare needs, etc."
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message to the Couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share your excitement, well wishes, or memories..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-2 px-6 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? 'Submitting...' : `Submit RSVP for ${partySize} ${partySize === 1 ? 'Guest' : 'Guests'}`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
