'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Gift,
  Save,
  DollarSign,
  CreditCard,
  Building,
  Eye,
  Download,
  BarChart3
} from 'lucide-react'

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  giftsEnabled: boolean
  paypalEmail?: string
  bankDetails?: string
  giftMessage?: string
}

interface GiftRecord {
  id: string
  amount: number
  currency: string
  message?: string
  guestName: string
  guestEmail?: string
  createdAt: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
}

export default function GiftSettings() {
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
  const [gifts, setGifts] = useState<GiftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['settings', 'payment', 'gifts', 'reports'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  const [formData, setFormData] = useState({
    giftsEnabled: false,
    paypalEmail: '',
    bankDetails: '',
    giftMessage: ''
  })

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
      const [siteResponse, giftsResponse] = await Promise.all([
        fetch(`/api/wedding-sites/${siteId}`),
        fetch(`/api/wedding-sites/${siteId}/gifts`)
      ])

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        setSite(siteData)
        setFormData({
          giftsEnabled: siteData.giftsEnabled || false,
          paypalEmail: siteData.paypalEmail || '',
          bankDetails: siteData.bankDetails || '',
          giftMessage: siteData.giftMessage || ''
        })
      }

      if (giftsResponse.ok) {
        const giftsData = await giftsResponse.json()
        setGifts(giftsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
        alert('Gift settings updated successfully!')
        fetchData()
      } else {
        alert('Error updating gift settings')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error updating gift settings')
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getTotalGifts = () => {
    return gifts.filter(g => g.status === 'COMPLETED').reduce((sum, gift) => sum + gift.amount, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
              Gift Registry Settings
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
              Configure gift settings and view received gifts
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gifts</p>
                <p className="text-2xl font-semibold text-gray-900">{gifts.length}</p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-green-600">
                  ${getTotalGifts().toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {gifts.filter(g => g.status === 'COMPLETED').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'settings', label: 'Settings', icon: <Gift className="h-4 w-4" /> },
                { id: 'payment', label: 'Payment Setup', icon: <CreditCard className="h-4 w-4" /> },
                { id: 'gifts', label: 'Gifts Received', icon: <Eye className="h-4 w-4" /> },
                { id: 'reports', label: 'Gift Reports', icon: <Download className="h-4 w-4" /> }
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
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Gift Settings</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.giftsEnabled}
                      onChange={(e) => updateFormData('giftsEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable gift functionality</span>
                  </label>
                </div>

                {formData.giftsEnabled && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gift Message
                      </label>
                      <textarea
                        rows={4}
                        value={formData.giftMessage}
                        onChange={(e) => updateFormData('giftMessage', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                        placeholder="A message to display on your gift page..."
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        This message will be shown to guests when they visit the gift section.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* PayPal Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-blue-500" />
                          <h4 className="text-md font-medium text-gray-900">PayPal Settings</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            PayPal.me Username
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              paypal.me/
                            </span>
                            <input
                              type="text"
                              value={formData.paypalEmail}
                              onChange={(e) => updateFormData('paypalEmail', e.target.value)}
                              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                              placeholder="YourUsername"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Enter your PayPal.me username. <a href="https://www.paypal.com/paypalme/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Create one here</a> if you don&apos;t have one.
                          </p>
                        </div>
                      </div>

                      {/* Bank Transfer Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Building className="h-5 w-5 text-green-500" />
                          <h4 className="text-md font-medium text-gray-900">Bank Transfer Details</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Bank Account Details
                          </label>
                          <textarea
                            rows={4}
                            value={formData.bankDetails}
                            onChange={(e) => updateFormData('bankDetails', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                            placeholder={`Bank Name: Your Bank
Account Name: Your Name
Account Number: 123456789
Sort Code: 12-34-56
Reference: Wedding Gift`}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Provide your bank details for guests who prefer bank transfers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {!formData.giftsEnabled && (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Gift functionality is disabled
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Enable the gift functionality to allow guests to send monetary gifts.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Payment Setup</h3>
                <p className="text-gray-600">Configure payment methods and settings for receiving gifts.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* PayPal Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <CreditCard className="h-6 w-6 text-blue-500" />
                      <h4 className="text-lg font-medium text-gray-900">PayPal Configuration</h4>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900">PayPal Integration</h5>
                          <p className="text-sm text-blue-700 mt-1">
                            To receive gifts via PayPal, simply provide your PayPal email address in the Settings tab.
                            Guests will be able to send money directly to this email.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Current PayPal Email
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                          <span className="text-gray-900">
                            {formData.paypalEmail || 'Not configured'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h6 className="font-medium text-yellow-900">Important Notes:</h6>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• Ensure your PayPal account can receive payments</li>
                          <li>• Consider PayPal&apos;s transaction fees</li>
                          <li>• Test with a small amount before your wedding</li>
                          <li>• Keep your PayPal email secure</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Building className="h-6 w-6 text-green-500" />
                      <h4 className="text-lg font-medium text-gray-900">Bank Transfer Setup</h4>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-green-900">Direct Bank Transfers</h5>
                          <p className="text-sm text-green-700 mt-1">
                            Provide your bank details in the Settings tab for guests who prefer direct transfers.
                            This is especially useful for larger gifts.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Current Bank Details
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md min-h-[100px]">
                          <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                            {formData.bankDetails || 'Not configured'}
                          </pre>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h6 className="font-medium text-yellow-900">Security Tips:</h6>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• Only share necessary banking information</li>
                          <li>• Consider using a separate account for gifts</li>
                          <li>• Include a reference code for easy tracking</li>
                          <li>• Monitor your account regularly</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Need help setting up payments?</h5>
                      <p className="text-sm text-gray-600">Visit the Settings tab to configure your payment details.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                    >
                      Go to Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gifts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Gifts Received</h3>
                  <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>

                {gifts.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No gifts received yet
                    </h3>
                    <p className="text-gray-600">
                      Gifts from your guests will appear here once received.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Message
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gifts.map((gift) => (
                          <tr key={gift.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{gift.guestName}</div>
                                {gift.guestEmail && (
                                  <div className="text-sm text-gray-500">{gift.guestEmail}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {gift.currency} {gift.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {gift.message || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(gift.status)}`}>
                                {gift.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(gift.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Gift Reports</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Export CSV functionality
                        const csvContent = [
                          ['Guest Name', 'Email', 'Amount', 'Currency', 'Message', 'Status', 'Date'],
                          ...gifts.map(gift => [
                            gift.guestName,
                            gift.guestEmail || '',
                            gift.amount.toString(),
                            gift.currency,
                            gift.message || '',
                            gift.status,
                            new Date(gift.createdAt).toLocaleDateString()
                          ])
                        ].map(row => row.join(',')).join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `wedding-gifts-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Print Report</span>
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Amount</p>
                        <p className="text-3xl font-bold">${getTotalGifts().toFixed(2)}</p>
                        <p className="text-green-100">Received</p>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Average Gift</p>
                        <p className="text-3xl font-bold">
                          ${gifts.length > 0 ? (getTotalGifts() / gifts.filter(g => g.status === 'COMPLETED').length).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-blue-100">Per Guest</p>
                      </div>
                      <Gift className="h-12 w-12 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Completion Rate</p>
                        <p className="text-3xl font-bold">
                          {gifts.length > 0 ? Math.round((gifts.filter(g => g.status === 'COMPLETED').length / gifts.length) * 100) : 0}%
                        </p>
                        <p className="text-purple-100">Success</p>
                      </div>
                      <BarChart3 className="h-12 w-12 text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Gift Status Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Gift Status Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">Completed</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-green-600">
                            {gifts.filter(g => g.status === 'COMPLETED').length}
                          </span>
                          <div className="text-xs text-gray-500">
                            ${gifts.filter(g => g.status === 'COMPLETED').reduce((sum, g) => sum + g.amount, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">Pending</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-yellow-600">
                            {gifts.filter(g => g.status === 'PENDING').length}
                          </span>
                          <div className="text-xs text-gray-500">
                            ${gifts.filter(g => g.status === 'PENDING').reduce((sum, g) => sum + g.amount, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">Failed</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-red-600">
                            {gifts.filter(g => g.status === 'FAILED').length}
                          </span>
                          <div className="text-xs text-gray-500">
                            ${gifts.filter(g => g.status === 'FAILED').reduce((sum, g) => sum + g.amount, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gift Amount Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Gift Amount Distribution</h4>
                    <div className="space-y-3">
                      {[
                        { range: '$1 - $50', min: 1, max: 50, color: 'bg-blue-500' },
                        { range: '$51 - $100', min: 51, max: 100, color: 'bg-green-500' },
                        { range: '$101 - $250', min: 101, max: 250, color: 'bg-yellow-500' },
                        { range: '$251 - $500', min: 251, max: 500, color: 'bg-orange-500' },
                        { range: '$500+', min: 501, max: Infinity, color: 'bg-red-500' }
                      ].map((bucket) => {
                        const count = gifts.filter(g =>
                          g.status === 'COMPLETED' && g.amount >= bucket.min && g.amount <= bucket.max
                        ).length;
                        const percentage = gifts.filter(g => g.status === 'COMPLETED').length > 0
                          ? (count / gifts.filter(g => g.status === 'COMPLETED').length) * 100
                          : 0;

                        return (
                          <div key={bucket.range} className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{bucket.range}</span>
                                <span className="text-sm text-gray-500">{count} gifts</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`${bucket.color} h-2 rounded-full`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                {gifts.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Gift Trends</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gifts Received
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Average Gift
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(
                            gifts.reduce((acc, gift) => {
                              const month = new Date(gift.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                              });
                              if (!acc[month]) {
                                acc[month] = { count: 0, total: 0 };
                              }
                              if (gift.status === 'COMPLETED') {
                                acc[month].count++;
                                acc[month].total += gift.amount;
                              }
                              return acc;
                            }, {} as Record<string, { count: number; total: number }>)
                          ).map(([month, data]) => (
                            <tr key={month}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {month}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {data.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${data.total.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${data.count > 0 ? (data.total / data.count).toFixed(2) : '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}