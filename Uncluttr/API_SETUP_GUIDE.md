# 🔑 API Keys Setup Guide for Uncluttr

## Overview
Your Uncluttr app uses advanced AI capabilities that require API keys from various providers. Here's how to get them and why you need them.

## Required API Keys

### 1. OpenAI API Key (Primary AI Provider) 🤖
**What it's for:** 
- Daily briefing generation
- Text analysis and insights
- Audio transcription (Whisper)
- Smart recommendations
- RAG (Retrieval Augmented Generation)

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

**Cost:** Pay-per-use, ~$0.002 per 1K tokens (very affordable for personal use)

### 2. Anthropic Claude API Key (Backup AI Provider) 🧠
**What it's for:**
- Fallback when OpenAI is unavailable
- Alternative AI perspectives
- Enhanced reasoning capabilities

**How to get it:**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign up for access
3. Generate API key
4. Copy the key

**Cost:** Pay-per-use, competitive pricing

### 3. Google Cloud API Key (Optional) ☁️
**What it's for:**
- Google Calendar integration
- Google Assistant features
- Additional AI models

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable APIs (Calendar, AI Platform)
4. Create credentials > API Key
5. Copy the key

## Environment Setup

### Step 1: Update your `.env` file
Replace the placeholder values in `c:\Users\khush\startup\personal-life-ceo\Uncluttr\.env`:

```env
# Replace with your actual OpenAI API key
REACT_APP_OPENAI_API_KEY=sk-your-actual-openai-key-here

# Replace with your actual Anthropic API key (optional)
REACT_APP_ANTHROPIC_API_KEY=your-actual-anthropic-key-here

# Replace with your actual Google Cloud API key (optional)
REACT_APP_GOOGLE_CLOUD_API_KEY=your-actual-google-cloud-key-here

# Update this to your backend URL when deployed
REACT_APP_API_BASE_URL=https://api.uncluttr.app/api/ai
```

### Step 2: Restart your development server
After updating the `.env` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

## Why These APIs Are Essential

### 1. **RAG (Retrieval Augmented Generation)**
- Your app uses RAG to provide contextual, personalized responses
- It retrieves relevant information from your data and generates intelligent insights
- Examples: "Based on your sleep patterns, here's how to improve your energy"

### 2. **Agentic AI**
- Multiple AI agents work together (Health, Finance, Schedule, etc.)
- Each agent specializes in specific domains
- They collaborate to provide comprehensive life management insights

### 3. **Production-Grade Features**
- Real-time data analysis
- Personalized recommendations
- Cross-domain optimization
- Intelligent automation suggestions

## Cost Management

### Typical Monthly Usage for Personal Use:
- **OpenAI API:** $5-15/month for active usage
- **Anthropic API:** $3-10/month as backup
- **Total:** ~$8-25/month for advanced AI features

### Cost Optimization Tips:
1. **Caching:** The app caches responses for 1 hour
2. **Retry Logic:** Prevents unnecessary duplicate calls
3. **Fallback Strategy:** Uses cheaper models when possible
4. **Local Processing:** Some features work offline

## Security Best Practices

### ✅ Do:
- Keep API keys in `.env` file only
- Never commit `.env` to version control
- Use different keys for development/production
- Monitor usage in provider dashboards

### ❌ Don't:
- Share API keys publicly
- Hardcode keys in source code
- Use production keys in development
- Ignore usage alerts

## Testing Your Setup

After adding your API keys, test the features:

1. **Daily Briefing:** Should generate personalized content
2. **Health Insights:** Should analyze your health data
3. **Schedule Optimization:** Should provide smart recommendations
4. **Voice Features:** Should transcribe audio accurately

## Troubleshooting

### Common Issues:

**"Network Error"**
- Check your internet connection
- Verify API keys are correct
- Ensure you have credits in your API accounts

**"Cannot read property 'generateText' of null"**
- ✅ **FIXED:** This error has been resolved in the updated AIService

**Rate Limiting**
- The app handles rate limits automatically
- Implements exponential backoff
- Uses caching to reduce API calls

## Alternative Options

### Free Tier Usage:
- OpenAI provides $5 free credits for new accounts
- Anthropic offers free tier for testing
- You can start with free tiers and upgrade as needed

### Local AI (Advanced):
- Set `REACT_APP_ENABLE_LOCAL_AI=true` in `.env`
- Requires additional setup for on-device models
- Good for privacy-conscious users

## Next Steps

1. **Get your OpenAI API key** (minimum requirement)
2. **Update your `.env` file**
3. **Restart the app**
4. **Test the AI features**
5. **Monitor usage and costs**

Your Uncluttr app will transform from a simple interface to an intelligent life management system once these APIs are configured! 🚀
