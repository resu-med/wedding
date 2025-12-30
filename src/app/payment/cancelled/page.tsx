'use client'

import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="md" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-gray-400" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              No worries! Your payment was cancelled and no charges were made. You can try again whenever you&apos;re ready.
            </p>

            <div className="space-y-3">
              <Link
                href="/dashboard/create"
                className="group w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                <RotateCcw className="h-5 w-5" />
                Try Again
              </Link>
              <Link
                href="/dashboard"
                className="group w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Questions? Contact us at support@weddingprepped.com
        </p>
      </div>
    </div>
  )
}
