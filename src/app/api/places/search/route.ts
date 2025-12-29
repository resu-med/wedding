import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    // Use Google Places Text Search API
    const searchResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
    )

    if (!searchResponse.ok) {
      throw new Error('Google Places API error')
    }

    const searchData = await searchResponse.json()

    if (searchData.status !== 'OK' || !searchData.results?.length) {
      return NextResponse.json(
        { error: 'Place not found', status: searchData.status },
        { status: 404 }
      )
    }

    const place = searchData.results[0]
    const placeId = place.place_id

    // Get place details including photos
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,rating,website&key=${GOOGLE_API_KEY}`
    )

    if (!detailsResponse.ok) {
      throw new Error('Google Place Details API error')
    }

    const detailsData = await detailsResponse.json()
    const details = detailsData.result

    // Build photo URLs (up to 5 photos)
    const photoUrls: string[] = []
    if (details.photos && details.photos.length > 0) {
      const photosToFetch = details.photos.slice(0, 5)
      for (const photo of photosToFetch) {
        // Google Places Photo API URL
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
        photoUrls.push(photoUrl)
      }
    }

    return NextResponse.json({
      placeId,
      name: details.name,
      address: details.formatted_address,
      lat: details.geometry?.location?.lat,
      lng: details.geometry?.location?.lng,
      photos: photoUrls,
      rating: details.rating,
      website: details.website,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`
    })

  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json(
      { error: 'Failed to search place' },
      { status: 500 }
    )
  }
}
