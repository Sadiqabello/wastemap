# WasteMapNaija

**A community-driven waste reporting and cleanup coordination platform built for Nigeria.**

WasteMapNaija empowers citizens to report illegal dump sites, organize cleanup events, track environmental impact, and earn rewards — turning neglect into action, one report at a time.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Route Protection](#route-protection)
- [SEO & PWA](#seo--pwa)
- [Revenue Model](#revenue-model)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Nigeria generates over 32 million tons of solid waste annually, yet only a fraction is properly managed. WasteMapNaija bridges the gap between citizens, waste collectors, and government agencies by providing a real-time, map-based platform where anyone can:

- **Report** waste hotspots with camera-captured photos, GPS coordinates, and severity ratings
- **Track** the status of reports from submission to cleanup
- **Organize** community cleanup events with live streaming
- **Connect** with verified waste collectors for pickup services
- **Earn** green points and redeem them for airtime, data, or cash rewards
- **Compete** on leaderboards and unlock achievements
- **Receive** real-time notifications for points earned, report updates, and more

The platform covers all of Nigeria — from Lagos to Kano, Abuja to Port Harcourt.

---

## Key Features

### For Citizens
| Feature | Description |
|---------|-------------|
| **Waste Reporting** | Submit reports with camera-only photo capture, location, multi-select waste categories, and severity |
| **Interactive Map** | Leaflet-powered map with clustered markers showing all reports nationwide |
| **Dashboard** | Personal dashboard with report history, stats, and activity feed |
| **Events** | Browse and join community cleanup events with Jitsi-powered live streaming |
| **Dump Sites** | Discover and report known dump sites in your area |
| **Notifications** | Real-time notification bell with toast alerts for points, report updates, bids, achievements, and more |
| **Rewards** | Redeem earned points for airtime, mobile data, or bank transfers (admin-configurable point values) |
| **Referrals** | Invite friends with a unique referral code and earn bonus points |
| **Challenges** | Participate in time-limited challenges for extra points |
| **Achievements** | Unlock 18 badges as you contribute (First Report, Event Organizer, etc.) |
| **Leaderboard** | Compete with other users across tier rankings |
| **Premium** | Subscribe for premium perks including zero transaction fees |
| **Eco Tips** | Browse recycling and waste management tips |

### For Waste Collectors
| Feature | Description |
|---------|-------------|
| **Registration** | Register as a verified waste collector with service details |
| **Browse Jobs** | View open pickup requests from citizens |
| **Bid System** | Place bids on pickup requests and manage ongoing jobs |
| **Collector Dashboard** | Track active bids, completed pickups, and earnings |
| **Reviews** | Receive ratings and reviews from citizens after pickups |

### For Administrators
| Feature | Description |
|---------|-------------|
| **Full CRUD** | Create, read, update, and delete all platform data |
| **User Management** | Change roles, adjust points, edit profiles, create/delete users |
| **Report Management** | Edit reports, bulk status updates, delete reports |
| **Event Management** | Create, edit, approve, and delete events |
| **Rewards & Challenges** | Manage reward catalog, redemptions, and challenge campaigns |
| **Point Configuration** | Admin-configurable point values for all 16 earning actions via platform settings |
| **Collector Verification** | Verify or suspend collector registrations |
| **Sponsorships** | Manage corporate sponsor tiers (Bronze/Silver/Gold/Platinum) |
| **Carbon Impact** | Track and verify CO2 offset estimates per waste type |
| **Revenue Dashboard** | Monitor all revenue streams — fees, commissions, subscriptions |
| **Platform Settings** | Configure platform-wide settings including point values |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Shadcn/UI](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| **Backend** | Next.js Server Actions & API Routes |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) with real-time subscriptions |
| **Auth** | Supabase Auth with SSR cookie-based sessions, server-side initial state |
| **Storage** | Supabase Storage (report & cleanup images) |
| **Maps** | [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) with marker clustering |
| **Charts** | [Recharts](https://recharts.org) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **PDF** | jsPDF + html2canvas-pro (invoices, certificates) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev) toasts + Supabase Realtime notifications |
| **Live Streaming** | [Jitsi Meet](https://jitsi.org) External API (configurable domain) |
| **Camera** | MediaStream API (WebRTC) for camera-only photo capture |
| **SEO** | Dynamic sitemap, robots.txt, JSON-LD structured data, OG images, per-page metadata |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Project Structure

```
wastemap/
├── public/
│   └── images/              # Static images (auth pages, logo)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Login & Signup (route group)
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # API routes (webhooks, banks, data plans)
│   │   ├── dashboard/       # User dashboard
│   │   ├── reports/         # Report pages (list, detail, new)
│   │   ├── events/          # Events (list, detail, new)
│   │   ├── rewards/         # Rewards & redemption history
│   │   ├── collectors/      # Collector pages (browse, register, dashboard)
│   │   ├── dump-sites/      # Dump site pages
│   │   ├── notifications/   # Notifications page
│   │   ├── sitemap.ts       # Dynamic sitemap generation
│   │   ├── robots.ts        # Search engine crawl rules
│   │   ├── manifest.ts      # PWA manifest
│   │   ├── opengraph-image.tsx # Auto-generated OG image
│   │   ├── icon.svg         # App favicon (green map pin)
│   │   └── ...              # Other feature pages
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── auth/            # Auth background pattern
│   │   ├── layout/          # Header, mobile nav
│   │   ├── map/             # Map components
│   │   ├── notifications/   # Notification bell & list
│   │   ├── ui/              # Shadcn/UI primitives
│   │   └── ...              # Feature components (reports, events, collectors, etc.)
│   ├── lib/
│   │   ├── actions/         # Server actions ("use server")
│   │   ├── queries/         # Data fetching functions
│   │   ├── validators/      # Zod schemas
│   │   ├── providers/       # Payment & fulfillment providers
│   │   ├── supabase/        # Supabase client utilities (server, client, admin)
│   │   ├── constants.ts     # App-wide constants (points, tiers, fees, CO2 factors)
│   │   └── utils.ts         # Utility functions
│   ├── providers/           # React context providers (AuthProvider)
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── migrations/          # SQL migration files (001–016)
│   └── seed.sql             # Seed data (achievements, rewards, challenges, point settings)
├── middleware.ts             # Auth protection & session refresh
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm**, **yarn**, **pnpm**, or **bun**
- A [Supabase](https://supabase.com) project (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/wastemapnaija.git
   cd wastemapnaija
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) below.

4. **Set up the database**

   Run the migrations in order (001–016) against your Supabase project using the SQL Editor in the Supabase Dashboard. Then run `seed.sql` for sample data (achievements, rewards, challenges, point settings).

5. **Enable Supabase Realtime**

   In the Supabase Dashboard, go to **Database > Replication** and enable Realtime for the `notifications` and `profiles` tables. This powers the real-time notification bell and live profile/points updates.

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Map defaults
NEXT_PUBLIC_DEFAULT_MAP_CENTER=9.0579,7.4951
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=12

# Jitsi domain for live streaming (must allow anonymous/guest access)
# Default: meet.ffmuc.net (free, anonymous, community-run)
# Other options: jitsi.member.fsf.org, meet.jit.si (requires login)
NEXT_PUBLIC_JITSI_DOMAIN=meet.ffmuc.net

# VTPass API (airtime & data fulfillment)
# Sandbox: https://sandbox.vtpass.com
# Live: https://api-service.vtpass.com
VTPASS_BASE_URL=https://sandbox.vtpass.com
VTPASS_API_KEY=your-vtpass-api-key
VTPASS_SECRET_KEY=your-vtpass-secret-key
VTPASS_PUBLIC_KEY=your-vtpass-public-key

# Paystack API (bank transfers for reward redemptions)
PAYSTACK_SECRET_KEY=sk_test_your-paystack-key
```

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is only used server-side for admin operations (notifications, point adjustments). Never expose it to the client.

---

## Database

WasteMapNaija uses Supabase (PostgreSQL) with the following tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with points, tier, referral codes, premium status |
| `reports` | Waste reports with location, images, multi-select categories, status |
| `status_updates` | Report status change audit trail |
| `upvotes` | Report upvotes by users |
| `events` | Community cleanup events with live streaming support |
| `event_attendees` | Event RSVPs |
| `point_transactions` | Points earned/spent log |
| `rewards` | Reward catalog (airtime, data, cash, merch) |
| `redemptions` | Reward redemption records |
| `referrals` | User referral tracking |
| `challenges` | Time-limited point challenges |
| `user_challenges` | User progress on challenges |
| `collector_profiles` | Verified waste collector profiles |
| `pickup_bids` | Collector bids on pickup requests |
| `collector_reviews` | Ratings and reviews for collectors |
| `sponsorships` | Corporate sponsorship records |
| `sponsored_rewards` | Sponsor-funded rewards |
| `carbon_tracking` | CO2 offset estimates per report |
| `achievements` | Achievement badge definitions (18 badges) |
| `user_achievements` | Unlocked achievements per user |
| `premium_subscriptions` | Premium user subscriptions |
| `platform_revenue` | Revenue tracking across all streams |
| `platform_settings` | Admin-configurable settings (point values, fees, etc.) |
| `dump_sites` | Known dump site locations with photos |
| `notifications` | User notifications with read status |

### Database Views

| View | Purpose |
|------|---------|
| `dashboard_stats` | Aggregated stats for the user dashboard |
| `admin_stats` | Platform-wide statistics for admin |
| `revenue_stats` | Revenue breakdown by stream |
| `carbon_stats` | Carbon impact summary |
| `collector_stats` | Collector performance metrics |

### RPC Functions

| Function | Purpose |
|----------|---------|
| `award_points` | Atomically award points and update tier |
| `admin_adjust_points` | Admin point adjustment with audit trail |
| `redeem_reward` | Process reward redemption with fee calculation |
| `update_user_tier` | Recalculate user tier based on points |
| `generate_referral_code` | Generate unique referral codes |

Migrations are in `supabase/migrations/` numbered 001 through 016.

---

## Route Protection

The middleware (`middleware.ts`) protects authenticated routes. Unauthenticated users are redirected to `/login` with a `redirectTo` parameter.

**Protected routes:** `/profile`, `/dashboard`, `/reports`, `/rewards`, `/referrals`, `/challenges`, `/achievements`, `/premium`, `/pickups`, `/collectors/register`, `/collectors/dashboard`, `/events/new`, `/dump-sites/new`, `/notifications`, `/admin/*`

**Public routes:** `/`, `/login`, `/signup`, `/events`, `/dump-sites`, `/collectors`, `/leaderboard`, `/tips`

Admin routes additionally require the `admin` role, enforced by `assertAdmin()` in server actions.

---

## SEO & PWA

WasteMapNaija includes comprehensive SEO and progressive web app support:

- **Dynamic sitemap** (`/sitemap.xml`) — auto-generated for all public pages
- **Robots.txt** (`/robots.txt`) — allows crawling public pages, blocks admin/profile/notification routes
- **JSON-LD structured data** — Organization and WebSite schema on every page
- **Open Graph & Twitter cards** — auto-generated OG image with branding
- **Per-page metadata** — unique title and description for every public page
- **Dynamic metadata** — report detail pages generate metadata from database content
- **PWA manifest** — installable as a mobile app with themed icons
- **SVG favicon** — branded green map pin icon

---

## Notification System

WasteMapNaija features a comprehensive real-time notification system:

| Event | Notification |
|-------|-------------|
| Points earned | Toast + notification for every point-earning action |
| Report status changed | Owner notified when status updated |
| Report upvoted | Owner notified when someone upvotes their report |
| Event RSVP | Organizer notified when someone RSVPs |
| Bid received | Report owner notified of new collector bid |
| Bid accepted | Collector notified when their bid is accepted |
| Bid completed | Both parties notified on pickup completion |
| Achievement unlocked | User notified when earning a badge |
| Challenge completed | User notified on challenge completion |
| Collector status change | Collector notified of verification/suspension |
| Admin point adjustment | User notified of manual point changes |
| Redemption update | User notified of refunded redemptions |

Notifications are delivered via:
- **Real-time bell icon** in the header with unread count badge (Supabase Realtime)
- **Toast popups** for immediate feedback (Sonner)
- **Notifications page** (`/notifications`) with full history, mark as read, and delete

---

## Revenue Model

WasteMapNaija sustains itself through multiple revenue streams:

| Stream | Rate |
|--------|------|
| Redemption transaction fee | 5% (waived for premium users) |
| Collector pickup commission | 15% per completed bid |
| Premium subscriptions | 1,000 / 2,500 / 8,000 pts (30/90/365 days) |
| Corporate sponsorships | Bronze / Silver / Gold / Platinum tiers |
| Carbon credit tracking | Verified CO2 offsets per waste type |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

The app is deployed on **Vercel** at [wastemapnaija.com.ng](http://wastemapnaija.com.ng). To deploy your own instance:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard (set `NEXT_PUBLIC_APP_URL` to your production domain)
4. Deploy

Vercel automatically handles builds, edge functions, and the middleware.

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Please ensure your code passes linting (`npm run lint`) and builds successfully (`npm run build`) before submitting.

---

## License

This project is private and not currently open-sourced. All rights reserved.

---

<p align="center">
  <strong>WasteMapNaija</strong> — Mapping a cleaner Nigeria, one report at a time.
</p>
