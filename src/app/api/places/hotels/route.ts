import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '5000' // Default 5km radius

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Places API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Search for lodging (hotels, B&Bs, etc.) near the location
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${apiKey}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: 'Failed to search for hotels' },
        { status: 500 }
      )
    }

    // Transform results to a cleaner format
    const hotels = (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      photo: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      types: place.types || [],
      openNow: place.opening_hours?.open_now ?? null
    }))

    // Sort by rating (highest first)
    hotels.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))

    return NextResponse.json({
      hotels,
      total: hotels.length
    })
  } catch (error) {
    console.error('Error searching for hotels:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
