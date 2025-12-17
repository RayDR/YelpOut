# YelpOut - AI Conversational Event Planner

**YelpOut** is an intelligent, conversational web application that helps users plan perfect outings and events through natural conversation. Powered by AI and integrated with Yelp Fusion API, it provides personalized recommendations for restaurants, activities, and entertainment based on user preferences.

---

## Features

### Conversational Planning
- **Natural Language Interface**: Chat naturally with the AI to plan your outing
- **Smart Context Awareness**: Understands event types (dates, family, friends, solo)
- **Interactive Chip Selection**: Quick selection with visual chips for preferences
- **Bilingual Support**: Full English and Spanish support with language toggle

### Intelligent Recommendations
- **Time-Based Intelligence**: Morning suggestions show breakfast places, evening shows fine dining
- **Yelp Integration**: Real business data with ratings, prices, and locations
- **Context-Aware Search**: Considers group size, budget, mood, cuisine preferences
- **Distance Calculations**: Shows how far venues are from your location

### Complete Itinerary Planning
- **Multi-Block Scheduling**: Meals, desserts, activities, and after-hours
- **Time Allocation**: Smart duration calculation for each stop
- **Skip Functionality**: Hide blocks you don't want in your plan
- **Refinement Options**: Adjust location, date, time, budget, and more with one click

### Email Delivery
- **Beautiful HTML Emails**: Professional gradient design with all details
- **Yelp Links**: Direct links to business pages for more info
- **Map Integration**: Google Maps links for each location
- **Responsive Design**: Looks great on all devices

### Accessibility Features
- **Text-to-Speech (TTS)**: AI reads messages aloud
- **Speech-to-Text (STT)**: Talk to the AI instead of typing
- **Dark Mode**: Eye-friendly dark theme
- **Mobile Optimized**: Fully responsive design

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Yelp API credentials ([Get them here](https://www.yelp.com/developers))
- PM2 for production deployment: `npm install -g pm2`

### Installation

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd yelpout
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create your local configuration file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your credentials:

**Required for Yelp Integration:**
- Get your Yelp API credentials at: https://www.yelp.com/developers/v3/manage_app
- Copy your `API Key` and `Client ID`

**Required for Email Feature:**
- Use your SMTP provider credentials (IONOS, Gmail, SendGrid, etc.)
- For Gmail: use App Password, not regular password
- For IONOS: use your email account credentials

Example `.env.local`:
```env
# Yelp API (REQUIRED)
YELP_API_KEY=SAvJh-593UmQwiOiMXrJLopVECSW...  # Your actual API key
YELP_CLIENT_ID=abc123xyz...                    # Your actual Client ID

# Email SMTP (REQUIRED for email feature)
SMTP_HOST=smtp.ionos.com                       # Your SMTP host
SMTP_PORT=587                                   # Usually 587 for TLS
SMTP_USER=no-reply@yourdomain.com              # Your email
SMTP_PASSWORD=your_secure_password             # Your SMTP password
EMAIL_FROM=no-reply@yourdomain.com             # Sender email

# Application Settings
PORT=3010                                       # Server port
NODE_ENV=development                            # development or production
NEXT_PUBLIC_APP_URL=http://localhost:3010      # Your app URL
```

**Important Notes:**
- Never commit `.env.local` to git (it's in `.gitignore`)
- The `.env.example` file is a template - don't modify it
- For production, use `NODE_ENV=production`

4. **Run in development**
```bash
npm run dev
```

Visit: `http://localhost:3010`

5. **Build for production**
```bash
npm run build
```

6. **Start production server**
```bash
# Option 1: PM2 (recommended)
pm2 start ecosystem.config.js

# Option 2: Direct
npm start
```

---

## Project Structure

```
yelpout/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── yelp/            # Yelp recommendations endpoint
│   │   │   └── send-itinerary/  # Email sending endpoint
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main application page
│   │
│   ├── modules/                  # Feature modules
│   │   ├── chat/                # Chat interface
│   │   │   ├── components/      # Message bubbles, input, list
│   │   │   └── hooks/           # Chat state management
│   │   ├── planning/            # Itinerary planning
│   │   │   ├── components/      # ItineraryView, PlanCard
│   │   │   └── types/           # Plan interfaces
│   │   ├── speech/              # Voice features
│   │   │   ├── components/      # TTS/STT controls
│   │   │   └── hooks/           # Speech synthesis/recognition
│   │   └── translation/         # Internationalization
│   │       └── hooks/           # Language switching
│   │
│   ├── shared/                   # Shared components & utilities
│   │   ├── components/
│   │   │   ├── Chips.tsx        # Selection chips
│   │   │   ├── StarterCards.tsx # Event type cards
│   │   │   ├── LanguageToggle.tsx # Language switcher
│   │   │   ├── PrivacyNotice.tsx  # Privacy collapsible footer
│   │   │   └── Footer.tsx       # App footer with credits
│   │   └── hooks/
│   │       ├── useAppStore.ts   # Global Zustand store
│   │       └── useSessionStore.ts # Session persistence
│   │
│   └── lib/                      # Core utilities & services
│       ├── conversation/
│       │   ├── flow.ts          # Question flow logic
│       │   ├── parser.ts        # User input parsing
│       │   └── context.ts       # Conversation context
│       ├── planner/
│       │   └── blocks.ts        # Itinerary block derivation
│       ├── yelp/
│       │   ├── client.ts        # Yelp API client
│       │   └── normalize.ts     # Response normalization
│       ├── email/
│       │   ├── sender.ts        # Email sending logic
│       │   └── templates/       # HTML/text templates
│       └── i18n/
│           └── translations.ts  # All translations
│
├── public/                       # Static assets
│   ├── icon-512.png             # App icon
│   └── logo-animated.svg        # Animated logo
│
├── ecosystem.config.js           # PM2 configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment template
├── .env.local                   # Local environment (create this)
└── logs/                        # Application logs (PM2)
    ├── pm2-out.log              # Standard output
    └── pm2-error.log            # Error logs
```

---

## Technology Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14.2 (App Router) |
| **UI Library** | React 18 |
| **Styling** | TailwindCSS + Framer Motion |
| **State Management** | Zustand |
| **Language** | TypeScript |
| **APIs** | Yelp Fusion API |
| **Email** | Nodemailer (IONOS SMTP) |
| **Deployment** | PM2 + Nginx + SSL |
| **i18n** | Custom translation system |

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `YELP_API_KEY` | Your Yelp Fusion API key | ✅ Yes |
| `YELP_CLIENT_ID` | Your Yelp Client ID | ✅ Yes |
| `SMTP_HOST` | SMTP server hostname | ✅ Yes (for email) |
| `SMTP_PORT` | SMTP server port | ✅ Yes (for email) |
| `SMTP_USER` | SMTP username | ✅ Yes (for email) |
| `SMTP_PASSWORD` | SMTP password | ✅ Yes (for email) |
| `EMAIL_FROM` | Sender email address | ✅ Yes (for email) |
| `PORT` | Application port | ⚠️ Default: 3010 |
| `NODE_ENV` | Environment mode | ⚠️ production/development |
| `NEXT_PUBLIC_APP_URL` | Public URL | ⚠️ For production |

### Getting API Credentials

#### Yelp API Setup

1. Visit [Yelp Developers](https://www.yelp.com/developers/v3/manage_app)
2. Log in or create a Yelp account
3. Click "Create New App"
4. Fill in your app details:
   - **App Name:** YelpOut (or your choice)
   - **Industry:** Technology
   - **Description:** Event planning application
5. Accept terms and create app
6. Copy your credentials:
   - **API Key** → Use for `YELP_API_KEY`
   - **Client ID** → Use for `YELP_CLIENT_ID`

#### SMTP Email Setup

**Option 1: Gmail (Free)**
1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password
4. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

**Option 2: IONOS (Paid)**
```env
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=your-email@yourdomain.com
```

**Option 3: SendGrid (Free tier available)**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Use these settings:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=your-verified-sender@yourdomain.com
   ```

### PM2 Configuration

The `ecosystem.config.js` file is already configured with:
- **Automatic restart** on crashes
- **Log rotation** to `logs/` directory
- **Memory limit** (1GB max)
- **Environment variables** loading
- **Date-formatted logs**

To view logs:
```bash
pm2 logs yelpout           # Live logs
pm2 logs yelpout --lines 100  # Last 100 lines
tail -f logs/pm2-out.log   # Direct file access
```

### Nginx Configuration

For production deployment with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yelpout.domoforge.com;
    
    ssl_certificate /etc/letsencrypt/live/yelpout.domoforge.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yelpout.domoforge.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yelpout.domoforge.com;
    return 301 https://$server_name$request_uri;
}
```

---

## How It Works

### 1. Conversational Flow

The conversation follows a smart question sequence:

1. **Event Type Selection** - Date, family outing, friends, solo, or other
2. **Location Input** - City, neighborhood, or specific address
3. **Date Selection** - Today, tomorrow, specific date, or flexible
4. **Time Selection** - Morning, afternoon, evening, or custom time
5. **Group Size** - Number of adults, kids, and pets
6. **Budget Selection** - $ (cheap), $$ (moderate), $$$ (expensive), $$$$ (luxury)
7. **Optional Preferences**:
   - Cuisine types (Italian, Mexican, Asian, etc.)
   - Mood (romantic, casual, upscale, lively)
   - Duration (quick, standard, extended)

### 2. Intelligent Recommendation Engine

The system uses time-of-day intelligence:

| Time Period | Meal Suggestions | Dessert Suggestions | Activity Suggestions |
|-------------|------------------|---------------------|---------------------|
| **Morning** (6am-11am) | Breakfast places, brunch cafes, bakeries | Coffee shops, bakeries, donuts | Parks, museums, morning activities |
| **Midday** (11am-3pm) | Lunch restaurants, delis, sandwiches | Cafes, ice cream | Museums, galleries, tours |
| **Afternoon** (3pm-6pm) | Light cafes, snacks | Ice cream parlors, dessert cafes | Entertainment venues |
| **Evening** (6pm-10pm) | Dinner restaurants, fine dining | Specialty desserts, gelato | Theaters, entertainment |
| **Night** (10pm+) | Late-night diners, pubs | 24-hour cafes | Bars, lounges, nightlife |

### 3. Plan Generation

The system automatically creates an itinerary with:
- **Start and end times** for each block
- **Duration allocation** based on activity type
- **Distance calculations** from your location
- **Yelp ratings and price levels**
- **Category tags** for quick reference

### 4. Email Delivery

When users request to receive their plan via email:
- **HTML template** with gradient design and responsive layout
- **All business details** including ratings, categories, addresses
- **Direct links** to Yelp pages and Google Maps
- **Privacy notice** and attribution to Yelp

---

## Key Features Explained

### Skip Functionality
Users can skip any block they don't want:
- Click the **Skip** button next to block titles
- Skipped content is hidden but can be restored with **Undo**
- Validation ensures at least one item per category (meals, desserts, activities)

### Refinement System
After seeing their plan, users can quickly adjust:
- **Location** - Change city or neighborhood
- **Date** - Pick a different day
- **Time** - Adjust start time
- **Group** - Modify number of people
- **Budget** - Change price range
- **Cuisine** - Add or remove cuisine preferences
- **Mood** - Adjust atmosphere preferences
- **Duration** - Make it quicker or longer

### Session Persistence
- All conversation history is saved in `sessionStorage`
- Plans remain visible even after sending email
- Users can close the browser and come back
- Clear data only when explicitly closed

### Language Toggle
- Switch between English and Spanish anytime
- Appears below the welcome message
- All UI elements update instantly
- Preserves conversation context

---

## Mobile Optimization

YelpOut is fully mobile-responsive with:
- **2-column grid** for event type cards on mobile
- **Compact chip layout** for small screens
- **Touch-optimized** buttons and controls
- **Scrollable plans** with fixed headers
- **Collapsible privacy footer** that doesn't block content

---

## Privacy & Security

- **No user tracking** - No analytics, cookies, or tracking scripts
- **Session-only storage** - Data stored locally in browser only
- **Secure SMTP** - Email sent via TLS-encrypted connection
- **API key protection** - All keys stored server-side only
- **Privacy notice** - Clear explanation of data usage in collapsible footer

---

## Deployment

### Quick Deploy

```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies (if package.json changed)
npm install

# 3. Build production bundle
npm run build

# 4. Restart PM2
pm2 restart yelpout --update-env

# 5. Verify deployment
pm2 status
pm2 logs yelpout --lines 50
```

### PM2 Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Restart application
pm2 restart yelpout

# Stop application
pm2 stop yelpout

# Delete from PM2
pm2 delete yelpout

# View logs
pm2 logs yelpout

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Troubleshooting

**Application won't start:**
```bash
# Check if port 3010 is available
lsof -i :3010

# Check PM2 logs
pm2 logs yelpout --err

# Verify environment variables
pm2 env 2

# Try manual start
PORT=3010 npm start
```

**Yelp API errors:**
- Verify `YELP_API_KEY` is correct in `.env.local`
- Check if `.env.local` is overriding `.env` (Next.js precedence)
- Restart with `pm2 restart yelpout --update-env`

**Email not sending:**
- Verify SMTP credentials are correct
- Check if port 587 is open
- Test SMTP connection manually
- Review logs for specific error messages

---

## Architecture Decisions

### Why Next.js App Router?
- Server-side rendering for better SEO
- API routes for secure backend operations
- Built-in optimization (images, fonts, scripts)
- TypeScript support out of the box

### Why Zustand over Redux?
- Simpler API with less boilerplate
- No providers needed
- Better TypeScript support
- Smaller bundle size

### Why Custom i18n Instead of next-intl?
- Lighter weight for our specific use case
- More control over translation loading
- Easier to maintain for two languages
- No routing complexity

### Why PM2?
- Zero-downtime restarts
- Automatic crash recovery
- Built-in log management
- Cluster mode support (future scaling)
- Memory monitoring and limits

---

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Yelp Fusion API Docs](https://www.yelp.com/developers/documentation/v3)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## 🤝 Contributing

This project is open source under the MIT License. Contributions are welcome!

If you'd like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Bug reports and suggestions:**
1. Document the issue clearly
2. Provide steps to reproduce
3. Suggest a solution if possible

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

**Copyright (c) 2024-2025 DomoForge**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

**The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.**

### 🏷️ Attribution Required

If you use this software in your project, please provide attribution:
- **Author**: DomoForge
- **Project**: YelpOut - AI Conversational Event Planner  
- **URL**: https://yelpout.domoforge.com

---

## 🙏 Credits

- **Yelp Fusion API** - Business data and recommendations
- **DomoForge** - Development and design
- **Next.js Team** - Amazing framework

---

## Support

For issues or questions:
- **Email**: support@domoforge.com
- **Production URL**: https://yelpout.domoforge.com

---

## Acknowledgments

Built with ❤️ by the DomoForge team for the 2024 competition.

Special thanks to:
- The Yelp team for their comprehensive API
- The Next.js community for excellent documentation
- Open source contributors who made our dependencies possible

---

**Made with YelpOut - Plan smarter, not harder.**
