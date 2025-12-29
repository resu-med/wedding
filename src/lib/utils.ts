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

// Map countries to their primary currencies
const countryCurrencyMap: Record<string, string> = {
  'Spain': 'EUR',
  'France': 'EUR',
  'Germany': 'EUR',
  'Italy': 'EUR',
  'Portugal': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Greece': 'EUR',
  'Ireland': 'EUR',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'New Zealand': 'NZD',
  'Switzerland': 'CHF',
  'Mexico': 'MXN',
  'Brazil': 'BRL',
  'Argentina': 'ARS',
  'India': 'INR',
  'Japan': 'JPY',
  'South Korea': 'KRW',
  'Singapore': 'SGD',
  'Thailand': 'THB',
  'Philippines': 'PHP',
  'South Africa': 'ZAR',
}

export function getCurrencyForCountry(country: string): string {
  return countryCurrencyMap[country] || 'USD'
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CAD': 'CA$',
    'AUD': 'A$',
    'NZD': 'NZ$',
    'CHF': 'CHF',
    'MXN': 'MX$',
    'BRL': 'R$',
    'ARS': 'AR$',
    'INR': '₹',
    'JPY': '¥',
    'KRW': '₩',
    'SGD': 'S$',
    'THB': '฿',
    'PHP': '₱',
    'ZAR': 'R',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
  }
  return symbols[currency] || currency
}