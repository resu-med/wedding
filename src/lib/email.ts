import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const client = getResendClient()
  if (!client) {
    console.log('RESEND_API_KEY not configured, skipping email')
    return null
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'Wedding Notifications <notifications@resu-med.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error sending email:', error)
    return null
  }
}

export function formatRSVPEmail({
  guestName,
  guestEmail,
  guestPhone,
  rsvpStatus,
  attendingCeremony,
  attendingReception,
  dietaryRequests,
  specialRequests,
  needsBusToVenue,
  needsBusFromVenue,
  plusOneName,
  message,
  partner1Name,
  partner2Name,
  partySize = 1,
}: {
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  rsvpStatus: string
  attendingCeremony: boolean
  attendingReception: boolean
  dietaryRequests?: string | null
  specialRequests?: string | null
  needsBusToVenue?: boolean
  needsBusFromVenue?: boolean
  plusOneName?: string | null
  message?: string | null
  partner1Name: string
  partner2Name: string
  partySize?: number
}) {
  const statusText = rsvpStatus === 'ATTENDING' ? 'Attending' :
                     rsvpStatus === 'NOT_ATTENDING' ? 'Not Attending' : 'Maybe'

  const statusColor = rsvpStatus === 'ATTENDING' ? '#22c55e' :
                      rsvpStatus === 'NOT_ATTENDING' ? '#ef4444' : '#f59e0b'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #ec4899; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New RSVP Received!</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            You have received a new RSVP for <strong>${partner1Name} & ${partner2Name}'s</strong> wedding.
          </p>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px 0;">Guest Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 140px;">Party Size:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${partySize} ${partySize === 1 ? 'guest' : 'guests'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 140px;">${partySize > 1 ? 'Guests:' : 'Name:'}</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; color: #111827;">${guestEmail}</td>
              </tr>
              ${guestPhone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0; color: #111827;">${guestPhone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500;">
                    ${statusText}
                  </span>
                </td>
              </tr>
              ${rsvpStatus === 'ATTENDING' ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Ceremony:</td>
                <td style="padding: 8px 0; color: #111827;">${attendingCeremony ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Reception:</td>
                <td style="padding: 8px 0; color: #111827;">${attendingReception ? 'Yes' : 'No'}</td>
              </tr>
              ${needsBusToVenue || needsBusFromVenue ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Bus Transfer:</td>
                <td style="padding: 8px 0; color: #111827;">${[needsBusToVenue ? 'To venue' : '', needsBusFromVenue ? 'From venue' : ''].filter(Boolean).join(', ')}</td>
              </tr>
              ` : ''}
              ` : ''}
              ${plusOneName ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Plus One:</td>
                <td style="padding: 8px 0; color: #111827;">${plusOneName}</td>
              </tr>
              ` : ''}
              ${dietaryRequests ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Dietary:</td>
                <td style="padding: 8px 0; color: #111827;">${dietaryRequests}</td>
              </tr>
              ` : ''}
              ${specialRequests ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Special Requests:</td>
                <td style="padding: 8px 0; color: #111827;">${specialRequests}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${message ? `
          <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #111827; font-size: 14px; margin: 0 0 8px 0;">Message from guest:</h3>
            <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
            View all RSVPs in your <a href="https://wedding-tiv4.vercel.app/dashboard" style="color: #ec4899;">wedding dashboard</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function formatGiftEmail({
  giverName,
  giverEmail,
  amount,
  currency,
  paymentMethod,
  message,
  anonymous,
  partner1Name,
  partner2Name,
}: {
  giverName: string
  giverEmail?: string | null
  amount: number
  currency: string
  paymentMethod: string
  message?: string | null
  anonymous: boolean
  partner1Name: string
  partner2Name: string
}) {
  const currencySymbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CAD': 'CA$',
    'AUD': 'A$',
  }
  const symbol = currencySymbols[currency] || currency

  const paymentMethodText = paymentMethod === 'PAYPAL' ? 'PayPal' :
                            paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : paymentMethod

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #22c55e; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Gift Received!</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Someone has sent a gift for <strong>${partner1Name} & ${partner2Name}'s</strong> wedding!
          </p>

          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin-bottom: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Gift Amount</p>
            <p style="color: #22c55e; font-size: 36px; font-weight: bold; margin: 0;">${symbol}${amount.toFixed(2)}</p>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">via ${paymentMethodText}</p>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px 0;">From</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">
                  ${anonymous ? 'Anonymous' : giverName}
                </td>
              </tr>
              ${!anonymous && giverEmail ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; color: #111827;">${giverEmail}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${message ? `
          <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #111827; font-size: 14px; margin: 0 0 8px 0;">Personal Message:</h3>
            <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}

          ${paymentMethod === 'BANK_TRANSFER' ? `
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Note:</strong> This gift was marked as "Bank Transfer". Please check your bank account to confirm receipt of the payment.
            </p>
          </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
            View all gifts in your <a href="https://wedding-tiv4.vercel.app/dashboard" style="color: #ec4899;">wedding dashboard</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
