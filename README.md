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
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Nigeria generates over 32 million tons of solid waste annually, yet only a fraction is properly managed. WasteMapNaija bridges the gap between citizens, waste collectors, and government agencies by providing a real-time, map-based platform where anyone can:

- **Report** waste hotspots with photos, GPS coordinates, and severity ratings
- **Track** the status of reports from submission to cleanup
- **Organize** community cleanup events
- **Connect** with verified waste collectors for pickup services
- **Earn** green points and redeem them for airtime, data, or cash rewards
- **Compete** on leaderboards and unlock achievements

The platform covers all of Nigeria — from Lagos to Kano, Abuja to Port Harcourt.

---

## Key Features

### For Citizens
| Feature | Description |
|---------|-------------|
| **Waste Reporting** | Submit reports with photos, location, waste type, and severity |
| **Interactive Map** | Leaflet-powered map with clustered markers showing all reports nationwide |
| **Dashboard** | Personal dashboard with report history, stats, and activity feed |
| **Events** | Browse and join community cleanup events near you |
| **Dump Sites** | Discover and report known dump sites in your area |
| **Rewards** | Redeem earned points for airtime, mobile data, or bank transfers |
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
| **Collector Verification** | Verify or suspend collector registrations |
| **Sponsorships** | Manage corporate sponsor tiers (Bronze/Silver/Gold/Platinum) |
| **Carbon Impact** | Track and verify CO2 offset estimates per waste type |
| **Revenue Dashboard** | Monitor all revenue streams — fees, commissions, subscriptions |
| **Platform Settings** | Configure platform-wide settings |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Shadcn/UI](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| **Backend** | Next.js Server Actions & API Routes |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Auth** | Supabase Auth with SSR cookie-based sessions |
| **Storage** | Supabase Storage (report images) |
| **Maps** | [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) with marker clustering |
| **Charts** | [Recharts](https://recharts.org) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **PDF** | jsPDF + html2canvas-pro (invoices, certificates) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev) toast notifications |
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
│   │   └── ...              # Other feature pages
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── auth/            # Auth background pattern
│   │   ├── layout/          # Header, mobile nav
│   │   ├── map/             # Map components
│   │   ├── ui/              # Shadcn/UI primitives
│   │   └── ...              # Feature components
│   ├── lib/
│   │   ├── actions/         # Server actions ("use server")
│   │   ├── queries/         # Data fetching functions
│   │   ├── validators/      # Zod schemas
│   │   ├── providers/       # Payment & fulfillment providers
│   │   ├── supabase/        # Supabase client utilities
│   │   ├── constants.ts     # App-wide constants
│   │   └── utils.ts         # Utility functions
│   ├── providers/           # React context providers
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── migrations/          # SQL migration files (001–013)
│   └── seed.sql             # Seed data
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

   Copy the example and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) below.

4. **Set up the database**

   Run the migrations in order (001–013) against your Supabase project, then run `seed.sql` for sample data.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paystack (for reward redemptions)
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# VTPass (for airtime/data fulfillment)
VTPASS_API_KEY=your-vtpass-api-key
VTPASS_SECRET_KEY=your-vtpass-secret-key
VTPASS_BASE_URL=https://vtpass.com/api
```

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is only used server-side for admin operations. Never expose it to the client.

---

## Database

WasteMapNaija uses Supabase (PostgreSQL) with the following core tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with points, tier, referral codes |
| `reports` | Waste reports with location, images, status |
| `status_updates` | Report status change history |
| `upvotes` | Report upvotes by users |
| `events` | Community cleanup events |
| `event_attendees` | Event RSVPs |
| `point_transactions` | Points earned/spent log |
| `rewards` | Reward catalog (airtime, data, cash, merch) |
| `redemptions` | Reward redemption records |
| `referrals` | User referral tracking |
| `challenges` | Time-limited point challenges |
| `collector_profiles` | Verified waste collector profiles |
| `pickup_bids` | Collector bids on pickup requests |
| `sponsorships` | Corporate sponsorship records |
| `carbon_tracking` | CO2 offset estimates per report |
| `achievements` | Achievement badge definitions |
| `premium_subscriptions` | Premium user subscriptions |
| `platform_revenue` | Revenue tracking across all streams |

Migrations are in `supabase/migrations/` numbered 001 through 013.

---

## Route Protection

The middleware (`middleware.ts`) protects authenticated routes. Unauthenticated users are redirected to `/login` with a `redirectTo` parameter.

**Protected routes:** `/profile`, `/dashboard`, `/reports`, `/rewards`, `/referrals`, `/challenges`, `/achievements`, `/premium`, `/pickups`, `/collectors/register`, `/collectors/dashboard`, `/events/new`, `/dump-sites/new`, `/admin/*`

**Public routes:** `/`, `/login`, `/signup`, `/events`, `/dump-sites`, `/collectors`, `/leaderboard`, `/tips`

Admin routes additionally require the `admin` role, enforced by `assertAdmin()` in server actions.

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

The app is deployed on **Vercel**. To deploy your own instance:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard
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
