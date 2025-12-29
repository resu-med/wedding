'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

interface VenuePhotoCarouselProps {
  photos: string[]
  venueName: string
  primaryColor: string
}

export default function VenuePhotoCarousel({ photos, venueName, primaryColor }: VenuePhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsAutoPlaying(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }

    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (!photos || photos.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">The Venue</h2>
          <div className="flex items-center justify-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
            <span className="text-lg">{venueName}</span>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Image */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            style={{ aspectRatio: '16/9' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={photo}
                  alt={`${venueName} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            ))}

            {/* Navigation Arrows - Hidden on mobile, visible on larger screens */}
            <button
              onClick={() => {
                prevSlide()
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={() => {
                nextSlide()
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>

            {/* Photo counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                  setTimeout(() => setIsAutoPlaying(true), 10000)
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={{
                  backgroundColor: index === currentIndex ? primaryColor : undefined
                }}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail Strip - Hidden on small mobile, visible on larger screens */}
          <div className="hidden sm:flex justify-center mt-4 gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                  setTimeout(() => setIsAutoPlaying(true), 10000)
                }}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-2 ring-offset-2 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  ringColor: index === currentIndex ? primaryColor : undefined
                }}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Swipe hint for mobile */}
          <p className="text-center text-gray-500 text-sm mt-4 md:hidden">
            Swipe to see more photos
          </p>
        </div>
      </div>
    </section>
  )
}
