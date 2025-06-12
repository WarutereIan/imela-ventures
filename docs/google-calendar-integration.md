# Google Calendar Integration Guide

## Overview
The booking system has been updated to integrate with Google Calendar API. When a client books a session, it will automatically create a calendar event for the counselor with all the booking details.

## Current Implementation Status
✅ **Completed:**
- Removed pricing from booking flow
- Updated booking component to prepare calendar event data
- Added time conversion utilities
- Created event structure with client details and reminders

🔄 **To Complete:**
- Google Calendar API authentication
- Actual calendar event creation
- Error handling and user feedback
- Email confirmations

## Google Calendar API Setup

### 1. Enable Google Calendar API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Create credentials (Service Account for server-side or OAuth 2.0 for client-side)

### 2. Authentication Options

#### Option A: Service Account (Recommended for server-side)
```javascript
// Install required package
npm install googleapis

// Service account implementation
import { google } from 'googleapis';

const calendar = google.calendar({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    keyFile: 'path/to/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  })
});
```

#### Option B: OAuth 2.0 (Client-side)
```javascript
// Install required package
npm install gapi-script

// OAuth implementation
import { gapi } from 'gapi-script';

const initializeGapi = async () => {
  await gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: 'YOUR_API_KEY',
      clientId: 'YOUR_CLIENT_ID',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar'
    });
  });
};
```

### 3. Update Environment Variables
Create a `.env.local` file with your credentials:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email_here
```

### 4. Replace the Mock Implementation

Replace the current `createCalendarEvent` function with:

```typescript
const createCalendarEvent = async (bookingData: {
  service: string;
  date: string;
  time: string;
  client: typeof formData;
}) => {
  const selectedServiceData = services.find(s => s.id === bookingData.service);
  if (!selectedServiceData) return { success: false, error: 'Service not found' };

  try {
    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: yourAuthInstance });

    const timeIn24Hour = convertTo24Hour(bookingData.time);
    const startDateTime = new Date(`${bookingData.date}T${timeIn24Hour}:00`);
    const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.durationMinutes * 60000);

    const event = {
      summary: `${selectedServiceData.title} - ${bookingData.client.name}`,
      description: `
        Client: ${bookingData.client.name}
        Email: ${bookingData.client.email}
        Phone: ${bookingData.client.phone}
        Client Type: ${bookingData.client.clientType}
        ${bookingData.client.additionalInfo ? `Additional Info: ${bookingData.client.additionalInfo}` : ''}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Africa/Nairobi',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Africa/Nairobi',
      },
      attendees: [
        {
          email: bookingData.client.email,
          displayName: bookingData.client.name,
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary', // or specific calendar ID
      resource: event,
      sendUpdates: 'all', // Send invitations to attendees
    });

    return { 
      success: true, 
      eventId: response.data.id,
      eventLink: response.data.htmlLink 
    };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return { success: false, error };
  }
};
```

## Features Implemented

### 1. Automatic Calendar Events
- Creates calendar events with session details
- Includes client information in event description
- Sets appropriate timezone (Africa/Nairobi)
- Adds email and popup reminders

### 2. Client Information Capture
- Full name, email, phone number
- Client type (new, returning, referred)
- Additional information/concerns
- Service type and duration

### 3. Smart Scheduling
- Excludes weekends from available dates
- Shows next 14 weekdays
- Time slots from 9 AM to 5 PM
- Automatic duration calculation

### 4. No Pricing Display
- Removed all pricing information from UI
- Booking flow focuses on appointment details
- Internal pricing maintained separately

## Next Steps

1. **Set up Google Cloud Project** and enable Calendar API
2. **Choose authentication method** (Service Account recommended)
3. **Install required dependencies** (`googleapis` or `gapi-script`)
4. **Replace mock implementation** with actual API calls
5. **Add error handling** for API failures
6. **Implement email confirmations** for successful bookings
7. **Add calendar availability checking** to prevent double-bookings

## Security Considerations

- Store API credentials securely in environment variables
- Use HTTPS for all API communications
- Implement proper error handling to avoid exposing sensitive information
- Consider rate limiting for API calls
- Validate all user inputs before creating calendar events

## Testing

Before going live:
1. Test with a separate test calendar
2. Verify timezone handling
3. Test email notifications
4. Validate event details and formatting
5. Test error scenarios (API failures, invalid data) 