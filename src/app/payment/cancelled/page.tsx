'use client'

import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made. You can try again whenever you're ready.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="inline-block w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
