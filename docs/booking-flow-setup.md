# Booking Flow Setup Guide

This document provides complete setup instructions for the booking submission and confirmation flow.

## 1. Supabase Table Schema

### `sessions` Table

Ensure your `sessions` table has the following columns:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
```

## 2. Row Level Security (RLS) Policies

### Enable RLS

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Allow anyone to create bookings (public insert)

```sql
CREATE POLICY "Anyone can create bookings"
ON sessions
FOR INSERT
TO public
WITH CHECK (true);
```

### Policy 2: Allow authenticated users (admins) to read all bookings

```sql
CREATE POLICY "Authenticated users can read all bookings"
ON sessions
FOR SELECT
TO authenticated
USING (true);
```

### Policy 3: Allow authenticated users (admins) to update bookings

```sql
CREATE POLICY "Authenticated users can update bookings"
ON sessions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### Policy 4: Allow public to read their own bookings (optional)

If you want customers to view their own bookings:

```sql
CREATE POLICY "Users can read their own bookings"
ON sessions
FOR SELECT
TO public
USING (true); -- Or use email matching: USING (email = current_setting('request.jwt.claims', true)::json->>'email')
```

## 3. Supabase Edge Functions

### Function 1: `send-booking-notification`

This function sends an email to the admin when a new booking is created.

**Location:** `supabase/functions/send-booking-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

serve(async (req) => {
  try {
    const { bookingId, customerName, email, phone, service, date, time, message } = await req.json();

    // Get admin email from settings
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'notification_email')
      .single();

    const adminEmail = settings?.value || 'admin@imelaventures.com';

    // Send email using Resend (or your email provider)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Imela Ventures <noreply@imelaventures.com>',
        to: [adminEmail],
        subject: `New Booking: ${service} - ${customerName}`,
        html: `
          <h2>New Booking Received</h2>
          <p>A new booking has been submitted:</p>
          <ul>
            <li><strong>Customer:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${time}</li>
            ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
          </ul>
          <p>Please log into your admin dashboard to confirm this booking.</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Function 2: `send-booking-confirmation`

This function sends a confirmation email to the customer when admin confirms the booking.

**Location:** `supabase/functions/send-booking-confirmation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

serve(async (req) => {
  try {
    const {
      bookingId,
      customerName,
      email,
      phone,
      service,
      date,
      time,
      message,
    } = await req.json();

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send confirmation email to customer
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Imela Ventures <info@imelaventures.com>',
        to: [email],
        subject: `Booking Confirmed: ${service}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3AAFA9;">Booking Confirmed!</h2>
            <p>Dear ${customerName},</p>
            <p>Your booking has been confirmed. Here are the details:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details</h3>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <h3>Next Steps</h3>
            <ul>
              <li>Please arrive 10 minutes before your scheduled time</li>
              <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
              <li>For any questions, reply to this email or call us at +254 721 803 569</li>
            </ul>

            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>The Imela Ventures Team</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation email sent successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## 4. Environment Variables

### Supabase Edge Functions Secrets

Set these secrets in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

Or set them in the Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Secrets
2. Add `RESEND_API_KEY` with your Resend API key

### Frontend Environment Variables

Ensure your `.env.local` file has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Email Provider Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain (or use their test domain)
4. Set the `RESEND_API_KEY` secret in Supabase

### Alternative Email Providers

You can modify the Edge Functions to use:
- **SendGrid**: Replace Resend API calls with SendGrid API
- **Mailgun**: Replace Resend API calls with Mailgun API
- **AWS SES**: Replace Resend API calls with AWS SES API
- **SMTP**: Use a library like `nodemailer` for SMTP

## 6. Testing the Flow

### Test Booking Submission

1. Fill out the booking form on the website
2. Submit the booking
3. Check that:
   - Success message appears: "Your booking has been submitted successfully..."
   - Booking appears in admin dashboard (Sessions tab)
   - Admin receives notification email

### Test Booking Confirmation

1. Go to `/admin` → Sessions tab
2. Find a pending booking
3. Click "Confirm Booking"
4. Check that:
   - Status changes to "confirmed" immediately
   - Success message appears: "Booking confirmed and checkout email sent successfully."
   - Customer receives confirmation email

## 7. Troubleshooting

### Booking Not Saving

- Check browser console for errors
- Verify RLS policies are correct
- Ensure `sessions` table exists with correct schema
- Check Supabase logs for insert errors

### Emails Not Sending

- Verify Edge Functions are deployed
- Check Edge Function logs in Supabase Dashboard
- Ensure `RESEND_API_KEY` secret is set
- Verify email provider API key is valid
- Check spam folder

### Admin Dashboard Not Showing Bookings

- Verify admin is authenticated (check Supabase Auth)
- Check RLS policies allow authenticated users to read
- Ensure real-time subscriptions are enabled
- Check browser console for errors

## 8. Production Checklist

- [ ] RLS policies are properly configured
- [ ] Edge Functions are deployed
- [ ] Email provider API keys are set as secrets
- [ ] Email templates are customized
- [ ] Error handling is tested
- [ ] Success messages are clear
- [ ] Real-time updates are working
- [ ] Admin authentication is secure
- [ ] Booking validation is working
- [ ] Email delivery is reliable

