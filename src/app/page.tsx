import Link from "next/link"
import { Heart, Calendar, Gift, Users, Camera, MessageCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-pink-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Forever Weddings
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create beautiful, personalized wedding websites for your special day.
            RSVP management, gift registry, and more - all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Create Your Wedding Site
            </Link>
            <Link
              href="/auth/signin"
              className="border border-pink-500 text-pink-500 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-pink-500" />}
            title="Event Management"
            description="Manage your wedding timeline, ceremony, and reception details in one place."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-pink-500" />}
            title="RSVP System"
            description="Streamlined RSVP collection with dietary preferences and plus-one management."
          />
          <FeatureCard
            icon={<Gift className="h-8 w-8 text-pink-500" />}
            title="Gift Registry"
            description="Accept monetary gifts via PayPal and bank transfer with personalized messages."
          />
          <FeatureCard
            icon={<Camera className="h-8 w-8 text-pink-500" />}
            title="Photo Gallery"
            description="Share your engagement photos and collect memories from guests."
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-pink-500" />}
            title="Guest Communication"
            description="Send updates and announcements to your wedding guests."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-pink-500" />}
            title="Customizable Design"
            description="Personalize colors, fonts, and layout to match your wedding theme."
          />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start planning?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of couples who have created their perfect wedding website.
          </p>
          <Link
            href="/auth/signup"
            className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
