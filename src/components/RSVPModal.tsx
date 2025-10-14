'use client'

import { useState } from 'react'
import { X, Heart, Users, Check } from 'lucide-react'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  siteId: string
  primaryColor: string
  partner1Name: string
  partner2Name: string
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: '',
    attendingCeremony: true,
    attendingReception: true,
    dietaryRequests: '',
    specialRequests: '',
    plusOneName: '',
    plusOneEmail: '',
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
          ...formData,
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
              Your RSVP has been submitted successfully. {partner1Name} and {partner2Name} appreciate your response!
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
              {[1, 2, 3].map((num) => (
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
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Your Information</h3>
                <p className="text-gray-600">Please provide your contact details</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  style={{ focusRingColor: primaryColor }}
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
                  style={{ focusRingColor: primaryColor }}
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
                  style={{ focusRingColor: primaryColor }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="py-2 px-6 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Attendance</h3>
                <p className="text-gray-600">Will you be attending our wedding?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  RSVP Status *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'ATTENDING', label: 'Joyfully Accept' },
                    { value: 'NOT_ATTENDING', label: 'Regretfully Decline' },
                    { value: 'MAYBE', label: 'Tentative' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="rsvpStatus"
                        value={option.value}
                        checked={formData.rsvpStatus === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.rsvpStatus === 'ATTENDING' && (
                <div className="space-y-4">
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
                      Attending Ceremony
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
                      Attending Reception
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
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
                  disabled={!formData.rsvpStatus}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Additional Details</h3>
                <p className="text-gray-600">Help us make your experience perfect</p>
              </div>

              <div>
                <label htmlFor="dietaryRequests" className="block text-sm font-medium text-gray-700">
                  Dietary Requirements or Allergies
                </label>
                <textarea
                  id="dietaryRequests"
                  name="dietaryRequests"
                  rows={3}
                  value={formData.dietaryRequests}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  style={{ focusRingColor: primaryColor }}
                />
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                  Special Requests or Accessibility Needs
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows={3}
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                  style={{ focusRingColor: primaryColor }}
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
                  style={{ focusRingColor: primaryColor }}
                />
              </div>

              <div className="flex justify-between">
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
                  {loading ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}