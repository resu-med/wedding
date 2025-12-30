'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-100 rounded-full mx-auto" />
            <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-600 mt-6 font-medium">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 flex items-center justify-center px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="md" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-pink-500/5 p-8 md:p-12 border border-pink-100">
          <div className="text-center">
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for your purchase! You&apos;re all set to create your beautiful wedding website.
            </p>

            <Link
              href="/dashboard/create"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5"
            >
              Create Your Wedding Site
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-6 text-sm text-gray-500">
              A receipt has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-100 rounded-full mx-auto" />
            <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-gray-600 mt-6 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
