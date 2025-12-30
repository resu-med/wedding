import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Price in pence (£1.00 = 100 pence) - TESTING PRICE
export const WEDDING_SITE_PRICE = 100
export const WEDDING_SITE_CURRENCY = 'gbp'
