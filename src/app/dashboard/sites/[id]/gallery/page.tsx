'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Camera,
  Upload,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'
import Image from 'next/image'

interface WeddingSite {
  id: string
  partner1Name: string
  partner2Name: string
  heroImage?: string
  galleryImages: string[]
}

export default function PhotoGallery() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [siteId, setSiteId] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      setSiteId(params.id as string)
    }
  }, [params.id])

  const [site, setSite] = useState<WeddingSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  useEffect(() => {
    if (!session || !siteId) {
      if (!session) {
        router.push('/auth/signin')
      }
      return
    }

    fetchSite()
  }, [session, siteId, router])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}`)
      if (response.ok) {
        const siteData = await response.json()
        setSite(siteData)
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'hero' | 'gallery') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      if (type === 'hero') {
        setUploadingHero(true)
      } else {
        setUploadingGallery(true)
      }

      const response = await fetch(`/api/wedding-sites/${siteId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        fetchSite() // Refresh data
      } else {
        alert('Error uploading image')
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error uploading image')
    } finally {
      setUploadingHero(false)
      setUploadingGallery(false)
    }
  }

  const removeImage = async (imageUrl: string, type: 'hero' | 'gallery') => {
    try {
      const response = await fetch(`/api/wedding-sites/${siteId}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, type }),
      })

      if (response.ok) {
        fetchSite()
      }
    } catch (error) {
      console.error('Error removing image:', error)
    }
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/sites/${siteId}`}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Site Management
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Photo Gallery
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {site && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {site.partner1Name} & {site.partner2Name}
            </h2>
            <p className="text-gray-600">
              Manage photos for your wedding website
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Hero Image Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">Hero Image</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Main image displayed on your wedding website homepage
              </p>
            </div>

            <div className="p-6">
              {site?.heroImage ? (
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <Image
                      src={site.heroImage}
                      alt="Hero"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(site.heroImage!, 'hero')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <UploadArea
                  onFileUpload={(file) => handleFileUpload(file, 'hero')}
                  loading={uploadingHero}
                  text="Upload hero image"
                />
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Photo Gallery</h3>
                </div>
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.multiple = true
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files) {
                        Array.from(files).forEach(file => {
                          handleFileUpload(file, 'gallery')
                        })
                      }
                    }
                    input.click()
                  }}
                  disabled={uploadingGallery}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{uploadingGallery ? 'Uploading...' : 'Add Photos'}</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Photos displayed in your wedding gallery
              </p>
            </div>

            <div className="p-6">
              {site?.galleryImages && site.galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {site.galleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-lg">
                        <Image
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(image, 'gallery')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No photos yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first photos to the gallery
                  </p>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.multiple = true
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files
                        if (files) {
                          Array.from(files).forEach(file => {
                            handleFileUpload(file, 'gallery')
                          })
                        }
                      }
                      input.click()
                    }}
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                  >
                    Upload Photos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function UploadArea({
  onFileUpload,
  loading,
  text
}: {
  onFileUpload: (file: File) => void
  loading: boolean
  text: string
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
    >
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        {loading ? 'Uploading...' : text}
      </p>
      <p className="text-gray-600 mb-4">
        Drag and drop your image here, or click to browse
      </p>
      <button
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              onFileUpload(file)
            }
          }
          input.click()
        }}
        disabled={loading}
        className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
      >
        Choose File
      </button>
    </div>
  )
}