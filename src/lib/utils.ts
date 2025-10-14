import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSubdomain(partner1: string, partner2: string): string {
  const cleanName1 = partner1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanName2 = partner2.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${cleanName1}and${cleanName2}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function isValidSubdomain(subdomain: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
  return regex.test(subdomain) && subdomain.length >= 3
}