import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Price in pence (£79.00 = 7900 pence)
export const WEDDING_SITE_PRICE = 7900
export const WEDDING_SITE_CURRENCY = 'gbp'
