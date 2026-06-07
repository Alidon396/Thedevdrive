# 🚀 TheDevDrive Sahiwal - Complete Setup Guide

## ✅ STEP 1: Create 8 Accounts (30 Minutes)

### 1. **Supabase** (Database) - 3 min
- Go to: https://supabase.com/
- Click "Sign Up"
- Use email: your-email@gmail.com
- Create project: "thedevdrive-sahiwal"
- **Save these:**
  - `SUPABASE_URL` (from Settings → API)
  - `SUPABASE_KEY` (from Settings → API → service_role key)

### 2. **OpenRouter** (Claude API) - 2 min
- Go to: https://openrouter.ai/
- Click "Sign Up"
- Use GitHub or email
- Go to Settings → API Keys
- **Save:** `OPENROUTER_KEY`

### 3. **Google Maps API** - 5 min
- Go to: https://console.cloud.google.com/
- Create new project: "thedevdrive-sahiwal"
- Search "Places API" → Enable
- Search "Maps API" → Enable
- Create API Key (Credentials)
- **Save:** `GOOGLE_MAPS_KEY`

### 4. **Resend** (Email) - 2 min
- Go to: https://resend.com/
- Click "Get Started"
- Sign up with email
- Go to API Keys
- **Save:** `RESEND_KEY`

### 5. **HuggingFace** (Deployment) - 3 min
- Go to: https://huggingface.co/
- Click "Sign Up"
- Use email
- Go to Settings → Access Tokens
- Create new token: "thedevdrive-agents"
- **Save:** `HUGGINGFACE_TOKEN`

### 6. **GitHub** (Version Control) - 2 min
- Go to: https://github.com/
- Click "Sign Up" (or login if you have account)
- Create new repository: "thedevdrive-sahiwal"
- **Save:** Your GitHub URL

### 7. **JazzCash/EasyPaisa** (Pakistan Payment) - 5 min
- Download JazzCash app (if you have Pakistani SIM)
- OR go to: https://www.jazzcash.com.pk/
- Register for merchant account
- Get your merchant code
- **Save:** `JAZZCASH_MERCHANT_CODE`

### 8. **VS Code + GitHub Copilot** - 2 min
- Download: https://code.visualstudio.com/
- Install
- Extensions → Search "GitHub Copilot"
- Install → Sign in with GitHub
- ✅ Ready to code!

---

## 📋 STEP 2: Create .env File

Create file in workspace root: **`.env`**

```env
# SUPABASE
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API KEYS
OPENROUTER_KEY=sk-or-v1...
GOOGLE_MAPS_KEY=AIzaSyD...
RESEND_KEY=re_...

# HUGGINGFACE
HUGGINGFACE_TOKEN=hf_...
HUGGINGFACE_USERNAME=your-username

# PAKISTAN PAYMENTS
JAZZCASH_MERCHANT_CODE=xxxxx
JAZZCASH_MERCHANT_PASSWORD=xxxxx
YOUR_WHATSAPP_PHONE=+92334XXXXXXX
YOUR_WHATSAPP_NAME=Ahmed

# DEPLOYMENT
HF_SPACE_URL=https://huggingface.co/spaces/YOUR_USERNAME/thedevdrive-sahiwal
NODE_ENV=production
```

---

## 🗄️ STEP 3: Setup Supabase Database

1. Go to Supabase Dashboard
2. Click "SQL Editor" on left
3. Click "New Query"
4. **Copy-paste the entire SQL schema** (see `SUPABASE_SCHEMA.sql`)
5. Click "Run"
6. ✅ All tables created!

Tables created:
- `leads` - Business contact info
- `audits` - Website analysis results
- `calls` - Phone call tracking
- `closes` - Deals won
- `daily_stats` - Analytics

---

## 🏗️ STEP 4: Project Structure

```
thedevdrive-sahiwal/
├── .env                          # Your credentials
├── SUPABASE_SCHEMA.sql          # Database tables
├── package.json                 # Node dependencies
├── agents/
│   ├── 1-lead-scraper.js        # Scrapes Google Maps
│   ├── 2-database-manager.js    # Manages Supabase
│   ├── 3-auditor.js             # Website analysis
│   ├── 4-mockup-generator.js    # React mockups
│   ├── 5-email-campaign.js      # Resend emails
│   ├── 6-whatsapp-redirect.js   # WhatsApp links
│   ├── 7-cold-call-coach.js     # Call coaching
│   ├── 8-tracker.js             # Funnel tracking
│   ├── 9-closing.js             # Deal closing
│   └── 10-analytics.js          # Daily reports
├── server.js                    # Main Express server
├── utils/
│   ├── supabase-client.js       # DB connection
│   ├── openrouter-client.js     # Claude API
│   └── payment-handler.js       # JazzCash/EasyPaisa
└── docs/
    ├── SETUP_GUIDE.md           # This file
    ├── API_REFERENCE.md         # API docs
    └── DEPLOYMENT.md            # HF Spaces deploy
```

---

## ✅ Account Setup Checklist

```
☐ Supabase account (save URL + keys)
☐ OpenRouter account (save API key)
☐ Google Maps API enabled (save key)
☐ Resend account (save API key)
☐ HuggingFace account (save token)
☐ GitHub account (create repo)
☐ JazzCash/EasyPaisa merchant setup
☐ VS Code + GitHub Copilot installed
☐ .env file created with all keys
☐ Supabase tables created from SQL
☐ Ready to code! ✅
```

---

## 🚀 What's Next?

1. ✅ You're here: Setup complete
2. → Build Agent 1: Lead Scraper (30 min)
3. → Build Agent 2-4: Analysis engines (1 hour)
4. → Build Agent 5-7: Outreach system (1 hour)
5. → Build Agent 8-10: Tracking & closing (1 hour)
6. → Deploy to HF Spaces (30 min)
7. → Start Day 1: Scrape 500+ leads

**Total setup to deployment: ~4 hours**
**Then 10 days of sales workflow: ~75-120K PKR 💰**

---

## ⚠️ Important Notes

- **Keep .env secret** - Never commit to GitHub
- **API costs** - Most are free tier compatible
- **Sahiwal market** - Use Roman Urdu in messages
- **Phone calls are money** - Each call = 15K PKR potential
- **Personal relationships matter** - Use local references

Ready to build? Let's go! 🔥
