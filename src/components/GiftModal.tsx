'use client'

import { useState } from 'react'
import { X, Gift, Heart, Check, CreditCard, Building } from 'lucide-react'

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  siteId: string
  primaryColor: string
  partner1Name: string
  partner2Name: string
  paypalEmail?: string
  giftMessage?: string
}

export default function GiftModal({
  isOpen,
  onClose,
  siteId,
  primaryColor,
  partner1Name,
  partner2Name,
  paypalEmail,
  giftMessage
}: GiftModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    giftType: 'MONETARY',
    amount: '',
    message: '',
    giftDescription: '',
    paymentMethod: '',
    giverName: '',
    giverEmail: '',
    giverPhone: '',
    anonymous: false
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
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          siteId,
          amount: formData.amount ? parseFloat(formData.amount) : null
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // If PayPal, redirect to PayPal
        if (formData.paymentMethod === 'PAYPAL' && paypalEmail) {
          const paypalUrl = `https://www.paypal.com/paypalme/${paypalEmail.replace('@', '')}/${formData.amount}`
          window.open(paypalUrl, '_blank')
        }

        setSubmitted(true)
      } else {
        alert('Error submitting gift. Please try again.')
      }
    } catch (error) {
      alert('Error submitting gift. Please try again.')
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
              Your gift has been recorded. {partner1Name} and {partner2Name} greatly appreciate your generosity!
            </p>
            {formData.paymentMethod === 'PAYPAL' && (
              <p className="text-sm text-gray-500 mt-2">
                If the PayPal window didn't open, please check your popup blocker.
              </p>
            )}
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
              <Gift className="h-6 w-6" style={{ color: primaryColor }} />
              <h2 className="text-2xl font-bold text-gray-900">Wedding Gift</h2>
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
                <h3 className="text-xl font-semibold text-gray-900">Gift Type</h3>
                <p className="text-gray-600">Choose how you'd like to contribute</p>
                {giftMessage && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{giftMessage}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.giftType === 'MONETARY'
                      ? 'border-opacity-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ borderColor: formData.giftType === 'MONETARY' ? primaryColor : undefined }}
                >
                  <input
                    type="radio"
                    name="giftType"
                    value="MONETARY"
                    checked={formData.giftType === 'MONETARY'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2" style={{ color: primaryColor }} />
                    <h4 className="font-semibold">Monetary Gift</h4>
                    <p className="text-sm text-gray-600">Contribute to their future</p>
                  </div>
                </label>

                <label
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.giftType === 'EXPERIENCE'
                      ? 'border-opacity-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ borderColor: formData.giftType === 'EXPERIENCE' ? primaryColor : undefined }}
                >
                  <input
                    type="radio"
                    name="giftType"
                    value="EXPERIENCE"
                    checked={formData.giftType === 'EXPERIENCE'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Gift className="h-8 w-8 mx-auto mb-2" style={{ color: primaryColor }} />
                    <h4 className="font-semibold">Experience Gift</h4>
                    <p className="text-sm text-gray-600">Give a memorable experience</p>
                  </div>
                </label>
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
                <h3 className="text-xl font-semibold text-gray-900">Gift Details</h3>
                <p className="text-gray-600">Provide details about your gift</p>
              </div>

              {formData.giftType === 'MONETARY' && (
                <>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Gift Amount *
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        required
                        min="1"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                        style={{ focusRingColor: primaryColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method *
                    </label>
                    <div className="space-y-3">
                      {paypalEmail && (
                        <label
                          className={`flex items-center border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.paymentMethod === 'PAYPAL'
                              ? 'border-opacity-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ borderColor: formData.paymentMethod === 'PAYPAL' ? primaryColor : undefined }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="PAYPAL"
                            checked={formData.paymentMethod === 'PAYPAL'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <CreditCard className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                          <div>
                            <h4 className="font-semibold">PayPal</h4>
                            <p className="text-sm text-gray-600">Pay securely with PayPal</p>
                          </div>
                        </label>
                      )}

                      <label
                        className={`flex items-center border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.paymentMethod === 'BANK_TRANSFER'
                            ? 'border-opacity-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ borderColor: formData.paymentMethod === 'BANK_TRANSFER' ? primaryColor : undefined }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="BANK_TRANSFER"
                          checked={formData.paymentMethod === 'BANK_TRANSFER'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Building className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                        <div>
                          <h4 className="font-semibold">Bank Transfer</h4>
                          <p className="text-sm text-gray-600">Direct bank transfer details will be provided</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {formData.giftType === 'EXPERIENCE' && (
                <div>
                  <label htmlFor="giftDescription" className="block text-sm font-medium text-gray-700">
                    Experience Description *
                  </label>
                  <textarea
                    id="giftDescription"
                    name="giftDescription"
                    required
                    rows={4}
                    value={formData.giftDescription}
                    onChange={handleChange}
                    placeholder="Describe the experience you're giving..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                    style={{ focusRingColor: primaryColor }}
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Personal Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add a personal message to the couple..."
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
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (formData.giftType === 'MONETARY' && (!formData.amount || !formData.paymentMethod)) ||
                    (formData.giftType === 'EXPERIENCE' && !formData.giftDescription)
                  }
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
                <h3 className="text-xl font-semibold text-gray-900">Your Information</h3>
                <p className="text-gray-600">Let them know who this gift is from</p>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleChange}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: primaryColor }}
                />
                <label htmlFor="anonymous" className="ml-3 text-gray-700">
                  Give this gift anonymously
                </label>
              </div>

              {!formData.anonymous && (
                <>
                  <div>
                    <label htmlFor="giverName" className="block text-sm font-medium text-gray-700">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="giverName"
                      name="giverName"
                      required
                      value={formData.giverName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                      style={{ focusRingColor: primaryColor }}
                    />
                  </div>

                  <div>
                    <label htmlFor="giverEmail" className="block text-sm font-medium text-gray-700">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="giverEmail"
                      name="giverEmail"
                      value={formData.giverEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                      style={{ focusRingColor: primaryColor }}
                    />
                  </div>

                  <div>
                    <label htmlFor="giverPhone" className="block text-sm font-medium text-gray-700">
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      id="giverPhone"
                      name="giverPhone"
                      value={formData.giverPhone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-black"
                      style={{ focusRingColor: primaryColor }}
                    />
                  </div>
                </>
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
                  type="submit"
                  disabled={loading || (!formData.anonymous && !formData.giverName)}
                  className="py-2 px-6 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? 'Submitting...' : 'Submit Gift'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}