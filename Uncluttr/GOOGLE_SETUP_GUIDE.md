# Google Calendar Integration Setup Guide

## Getting Your Google Web Client ID

### Step 1: Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. Click on the project dropdown at the top
2. Create a new project or select an existing one
3. Give it a name like "Uncluttr App" or "Personal Life CEO"

### Step 3: Enable APIs
1. Go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Google Calendar API**
   - **Google Sign-In API** 
   - **Google People API** (optional, for contact info)

### Step 4: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required fields:
   - App name: "Uncluttr" or "Personal Life CEO"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

### Step 5: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Name it something like "Uncluttr Web Client"
5. Add authorized origins:
   - `http://localhost:3000` (for development)
   - Your production domain when you deploy
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - Your production auth callback URL
7. Click "Create"

### Step 6: Copy Your Client ID
1. After creation, you'll see a popup with your credentials
2. Copy the **Client ID** (it looks like: `123456789-abcdefg.apps.googleusercontent.com`)
3. This is your `GOOGLE_WEB_CLIENT_ID`

### Step 7: Update Your .env File
Add this to your `.env` file:
```bash
GOOGLE_WEB_CLIENT_ID=your_actual_client_id_here
```

Replace `your_actual_client_id_here` with the Client ID you copied.

## For React Native (Android/iOS)

You'll also need to create additional OAuth clients for mobile:

### Android OAuth Client
1. Create another OAuth 2.0 Client ID
2. Choose "Android" as application type
3. You'll need your app's SHA-1 fingerprint (get this from your keystore)

### iOS OAuth Client  
1. Create another OAuth 2.0 Client ID
2. Choose "iOS" as application type
3. Enter your app's bundle identifier

## Testing Your Setup

Once configured, your app should be able to:
1. Authenticate users with Google
2. Access their Google Calendar
3. Create, read, update, and delete calendar events
4. Provide AI-powered scheduling suggestions

## Important Security Notes

1. **Never commit your actual client secrets to version control**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate your API keys**
4. **Monitor your API usage in Google Cloud Console**
5. **Set up proper rate limiting and error handling**

## Troubleshooting

### Common Issues:
- **"invalid_client" error**: Check that your client ID is correct
- **"redirect_uri_mismatch"**: Ensure your redirect URIs match exactly
- **"access_denied"**: Check your OAuth consent screen configuration
- **"quota_exceeded"**: Monitor your API usage limits

### Getting Help:
- Check Google Cloud Console logs
- Review the OAuth consent screen status
- Verify all required APIs are enabled
- Ensure your app is not in "Testing" mode for production use
