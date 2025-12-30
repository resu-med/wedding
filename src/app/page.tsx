import Link from "next/link"
import { Calendar, Gift, Users, Camera, MessageCircle, Sparkles, Check, ArrowRight, MapPin } from "lucide-react"
import { Logo } from "@/components/Logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-violet-50 rounded-full mb-8 border border-pink-100">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Beautiful wedding websites in minutes</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Your Love Story,{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                Beautifully Told
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create a stunning wedding website that captures the essence of your special day.
              RSVP management, gift registry, venue maps, and so much more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5"
              >
                Create Your Wedding Site
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors underline underline-offset-4"
              >
                See what&apos;s included
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Mobile-friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Instant setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All the tools to create, manage, and share your perfect wedding website.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Smart RSVP System"
              description="Collect responses with dietary preferences, plus-ones, and custom questions. Get real-time updates."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Gift Registry"
              description="Accept monetary gifts via PayPal or bank transfer. Guests can leave heartfelt messages."
              gradient="from-violet-500 to-purple-500"
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Venue Maps & Photos"
              description="Automatically fetch venue photos and interactive maps. Help guests find their way."
              gradient="from-fuchsia-500 to-pink-500"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Event Timeline"
              description="Share your wedding schedule with ceremony, reception, and all the special moments."
              gradient="from-amber-500 to-orange-500"
            />
            <FeatureCard
              icon={<Camera className="h-6 w-6" />}
              title="Photo Gallery"
              description="Showcase your engagement photos and let guests see your journey together."
              gradient="from-teal-500 to-cyan-500"
            />
            <FeatureCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="Guest Communication"
              description="Keep everyone informed with announcements and updates as your day approaches."
              gradient="from-indigo-500 to-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600">
                One payment. Full access. No hidden fees.
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-pink-50 via-white to-violet-50 rounded-3xl p-8 md:p-12 border border-pink-100 shadow-xl shadow-pink-500/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Best Value
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-gray-900">£79</span>
                    <span className="text-gray-500">one-time</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Custom wedding website",
                      "RSVP management & tracking",
                      "Gift registry with PayPal & bank",
                      "Venue photos & interactive maps",
                      "Photo gallery",
                      "Guest communication tools",
                      "Unlimited access until your big day",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    href="/auth/signup"
                    className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5"
                  >
                    Get Started Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Join couples who have created beautiful wedding websites with Wedding Prepped.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Create Your Wedding Site
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">W</span>
              </div>
              <span className="text-white font-medium">Wedding Prepped</span>
            </div>
            <div className="flex gap-8 text-gray-400 text-sm">
              <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Wedding Prepped. Made with love.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-100 transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} text-white mb-5 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
