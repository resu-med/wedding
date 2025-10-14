# 🚀 Wedding Planning App - Vercel Deployment Guide

## Step 1: Set Up Production Database (Neon)

1. **Go to [neon.tech](https://neon.tech)**
2. **Sign up/Login** and create a new project
3. **Name your project**: `wedding-planning-app`
4. **Copy the connection string** - it will look like:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
   ```

## Step 2: Deploy to Vercel

1. **Go to your Vercel dashboard**
2. **Click "New Project"**
3. **Import your GitHub repository**: `resu-med/wedding`
4. **Set these Environment Variables** before deploying:

### Required Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://your-neon-connection-string-here

# Authentication (IMPORTANT: Use the generated secret below)
NEXTAUTH_SECRET=DhP/YmFDsYGJnMHjVGRTiEsF7VfFEVIBxNikOe9O+FA=
NEXTAUTH_URL=https://your-app-name.vercel.app

# Optional PayPal (for gift functionality)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
```

### How to Add Environment Variables in Vercel:
1. In your project settings, go to "Environment Variables"
2. Add each variable one by one:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environment**: All (Production, Preview, Development)

## Step 3: Update NEXTAUTH_URL After Deployment

1. **After your first deployment**, copy your Vercel app URL
2. **Update the `NEXTAUTH_URL` environment variable** with your actual domain:
   ```
   NEXTAUTH_URL=https://your-actual-app-name.vercel.app
   ```
3. **Redeploy** to apply the changes

## Step 4: Initialize Database

After deployment, you'll need to run the database migrations:

1. **Go to your Vercel project dashboard**
2. **Go to Functions tab**
3. **Or run locally then deploy**:
   ```bash
   # Update your local .env with production DATABASE_URL
   npx prisma db push
   ```

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