# 🚀 Wedding Planning App - Vercel Deployment Guide

## Step 1: Deploy to Vercel (with Built-in Database)

1. **Go to your Vercel dashboard**
2. **Click "New Project"**
3. **Import your GitHub repository**: `resu-med/wedding`
4. **During setup, click "Storage" tab**
5. **Click "Create Database" → "Postgres"**
6. **Accept defaults and create database**

### This will automatically set up:
- ✅ **PostgreSQL database** hosted by Vercel
- ✅ **DATABASE_URL** environment variable
- ✅ **Connection pooling** and optimization

## Step 2: Set Additional Environment Variables

After creating the database, add these environment variables:

```bash
# Authentication (IMPORTANT: Use the generated secret below)
NEXTAUTH_SECRET=DhP/YmFDsYGJnMHjVGRTiEsF7VfFEVIBxNikOe9O+FA=
NEXTAUTH_URL=https://your-app-name.vercel.app

# Optional PayPal (for gift functionality)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
```

### How to Add Environment Variables:
1. In your project settings, go to "Environment Variables"
2. Add each variable:
   - **Environment**: All (Production, Preview, Development)

## Step 3: Deploy & Update URL

1. **Click "Deploy"**
2. **After deployment**, copy your Vercel app URL
3. **Update `NEXTAUTH_URL`** with your actual domain
4. **Redeploy** to apply changes

## Step 4: Database Initialization

The database will be automatically initialized on first deployment thanks to the `prisma generate` in our build script!

## 🎉 Your App Will Include:

✅ **Multi-tenant wedding websites**
✅ **Guest management & RSVP tracking**
✅ **Gift registry with payment processing**
✅ **Photo gallery management**
✅ **Analytics dashboard**
✅ **Mobile-responsive design**
✅ **Secure authentication**

## Optional: Custom Domain

In Vercel project settings, you can add a custom domain like:
- `weddingplanner.com`
- `yourweddings.app`

## Support & Features:

- **Guest Management**: Add guests, track RSVPs, send invitations
- **Wedding Details**: Edit ceremony info, venue, timeline
- **Gift Registry**: PayPal/bank transfer integration
- **Photo Gallery**: Upload and manage wedding photos
- **Analytics**: Track RSVPs, gifts, and guest engagement
- **Public Sites**: Each couple gets their own wedding website

---

**Generated with Claude Code** 🤖