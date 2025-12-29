'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Globe,
  Check,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface WeddingSite {
  id: string
  subdomain: string
  customDomain: string | null
  partner1Name: string
  partner2Name: string
}

interface DnsRecord {
  type: string
  name: string
  value: string
}

export default function DomainSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [siteId, setSiteId] = useState<string>('')
  const [site, setSite] = useState<WeddingSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [domainStatus, setDomainStatus] = useState<'none' | 'pending' | 'verified' | 'error'>('none')
  const [copied, setCopied] = useState<string | null>(null)

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
        setCustomDomain(data.customDomain || '')
        if (data.customDomain) {
          setDomainStatus('pending')
          verifyDomain(data.customDomain)
        }
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyDomain = async (domain: string) => {
    setVerifying(true)
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/verify-domain?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()
      setDomainStatus(data.verified ? 'verified' : 'pending')
    } catch (error) {
      console.error('Error verifying domain:', error)
      setDomainStatus('error')
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async () => {
    if (!customDomain.trim()) {
      // Clear custom domain
      setSaving(true)
      try {
        const response = await fetch(`/api/wedding-sites/${siteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customDomain: null })
        })
        if (response.ok) {
          setSite(prev => prev ? { ...prev, customDomain: null } : null)
          setDomainStatus('none')
          alert('Custom domain removed')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Failed to update')
      } finally {
        setSaving(false)
      }
      return
    }

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(customDomain)) {
      alert('Please enter a valid domain (e.g., wedding.example.com)')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: customDomain.toLowerCase() })
      })

      if (response.ok) {
        setSite(prev => prev ? { ...prev, customDomain: customDomain.toLowerCase() } : null)
        setDomainStatus('pending')
        alert('Domain saved! Now add the DNS records shown below.')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save domain')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save domain')
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const dnsRecords: DnsRecord[] = customDomain ? [
    { type: 'CNAME', name: customDomain, value: 'cname.vercel-dns.com' }
  ] : []

  // For apex domain (no subdomain like "www")
  const isApexDomain = customDomain && !customDomain.includes('.') || (customDomain.match(/\./g) || []).length === 1
  const apexRecords: DnsRecord[] = isApexDomain ? [
    { type: 'A', name: '@', value: '76.76.21.21' }
  ] : []

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-xl font-bold text-gray-900">Custom Domain</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {site.partner1Name} & {site.partner2Name}
            </h2>
            <p className="text-gray-600">
              Connect your own domain to make your wedding site easier to share
            </p>
          </div>
        )}

        {/* Current URLs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Wedding Site URLs</h3>

          <div className="space-y-4">
            {/* Default URL */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Default URL</p>
                <p className="font-medium text-gray-900">
                  wedding-tiv4.vercel.app/site/{site?.subdomain}
                </p>
              </div>
              <a
                href={`https://wedding-tiv4.vercel.app/site/${site?.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>

            {/* Custom Domain */}
            {site?.customDomain && domainStatus === 'verified' && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm text-green-600">Custom Domain (Active)</p>
                  <p className="font-medium text-gray-900">{site.customDomain}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <a
                    href={`https://${site.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Domain Setup */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Up Custom Domain</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Domain
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                placeholder="wedding.yourdomain.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-black"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your domain without https:// (e.g., stephenandnisa.com or wedding.yourdomain.com)
            </p>
          </div>

          {/* Domain Status */}
          {site?.customDomain && (
            <div className={`p-4 rounded-lg mb-6 ${
              domainStatus === 'verified'
                ? 'bg-green-50 border border-green-200'
                : domainStatus === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {domainStatus === 'verified' && <Check className="h-5 w-5 text-green-600" />}
                  {domainStatus === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                  {domainStatus === 'error' && <X className="h-5 w-5 text-red-600" />}
                  <span className={`font-medium ${
                    domainStatus === 'verified' ? 'text-green-800'
                    : domainStatus === 'error' ? 'text-red-800'
                    : 'text-yellow-800'
                  }`}>
                    {domainStatus === 'verified' && 'Domain Connected!'}
                    {domainStatus === 'pending' && 'Waiting for DNS configuration'}
                    {domainStatus === 'error' && 'Could not verify domain'}
                  </span>
                </div>
                <button
                  onClick={() => verifyDomain(site.customDomain!)}
                  disabled={verifying}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className={`h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />
                  <span>Check Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DNS Instructions */}
        {site?.customDomain && domainStatus !== 'verified' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">DNS Configuration</h3>
            <p className="text-gray-600 mb-4">
              Add these DNS records at your domain registrar (GoDaddy, Namecheap, etc.):
            </p>

            {/* CNAME Record */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {isApexDomain ? 'Option 1: A Record (for apex domain)' : 'CNAME Record'}
              </h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">Type</th>
                      <th className="px-4 py-2 text-left text-gray-600">Name/Host</th>
                      <th className="px-4 py-2 text-left text-gray-600">Value/Points to</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isApexDomain ? (
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3 font-mono">A</td>
                        <td className="px-4 py-3 font-mono">@</td>
                        <td className="px-4 py-3 font-mono">76.76.21.21</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyToClipboard('76.76.21.21', 'a-value')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copied === 'a-value' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3 font-mono">CNAME</td>
                        <td className="px-4 py-3 font-mono">{customDomain.split('.')[0]}</td>
                        <td className="px-4 py-3 font-mono">cname.vercel-dns.com</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyToClipboard('cname.vercel-dns.com', 'cname-value')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copied === 'cname-value' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need help?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• DNS changes can take up to 48 hours to propagate (usually faster)</li>
                <li>• Make sure you&apos;ve purchased the domain from a registrar</li>
                <li>• The domain must be added to your Vercel project as well</li>
              </ul>
            </div>
          </div>
        )}

        {/* Where to Buy */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Don&apos;t have a domain yet?</h3>
          <p className="text-gray-600 mb-4">
            You can purchase a domain from any of these registrars:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Namecheap', url: 'https://namecheap.com', price: 'from $8/yr' },
              { name: 'GoDaddy', url: 'https://godaddy.com', price: 'from $12/yr' },
              { name: 'Porkbun', url: 'https://porkbun.com', price: 'from $5/yr' },
              { name: 'Google Domains', url: 'https://domains.google', price: 'from $12/yr' }
            ].map((registrar) => (
              <a
                key={registrar.name}
                href={registrar.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
              >
                <p className="font-medium text-gray-900">{registrar.name}</p>
                <p className="text-sm text-gray-500">{registrar.price}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
