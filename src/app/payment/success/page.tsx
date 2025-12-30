'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      router.push('/dashboard')
      return
    }

    // Give webhook time to process, then redirect
    const timer = setTimeout(() => {
      setVerifying(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You can now create your wedding website.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Create Your Wedding Site
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
