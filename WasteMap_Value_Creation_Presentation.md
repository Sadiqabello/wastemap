# WasteMap: Value Creation & Monetization Strategy

### Turning Waste Reporting Into Real Impact and Real Value

---

## Table of Contents

1. Executive Summary
2. Platform Overview
3. Current State of the Points System
4. Value Creation for Reporters
5. Value Creation from Waste
6. Revenue Model
7. Implementation Roadmap
8. Technical Architecture for New Features
9. Key Metrics & Success Indicators
10. Call to Action

---

## 1. Executive Summary

WasteMap is a community-driven waste reporting and cleanup coordination platform built for Nigerian cities, starting with Abuja. Users report illegal dumpsites, organize cleanup events, and earn points through a gamification system.

**The Opportunity:**
The platform currently has all the infrastructure to track contributions but lacks a mechanism to convert those contributions into tangible value. By introducing a rewards marketplace, a waste collector network, and data monetization, WasteMap can become a self-sustaining ecosystem where:

- **Reporters** earn real value (airtime, data, cash) for keeping their communities clean
- **Waste collectors** access a marketplace of pickup opportunities
- **Government agencies** gain data intelligence for urban waste planning
- **Corporations** invest in visible, measurable CSR outcomes
- **The platform** generates sustainable revenue through commissions, subscriptions, and partnerships

---

## 2. Platform Overview

### What WasteMap Does Today

| Feature | Description |
|---------|-------------|
| **Waste Reporting** | Users photograph and geolocate illegal dumpsites with category and severity classification |
| **Interactive Map** | All reports displayed on a real-time map with clustering and severity-based color coding |
| **Cleanup Events** | Users organize community cleanups linked to specific waste reports |
| **Points & Gamification** | Users earn points for reporting, cleaning up, attending events, and community engagement |
| **Leaderboard** | Weekly, monthly, and all-time rankings drive healthy competition |
| **Admin Dashboard** | Full oversight with user management, report tracking, and analytics |
| **Authority Tools** | Government users can acknowledge, schedule, and resolve reports with audit trails |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Maps | Leaflet with React-Leaflet and marker clustering |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (report and cleanup photos) |
| Charts | Recharts for data visualization |
| Deployment | Vercel-ready |

### Waste Categories Tracked

- Household waste
- Industrial waste
- Hazardous waste
- Electronic waste (e-waste)
- Construction & demolition waste
- Medical waste
- Organic waste

### User Roles

| Role | Capabilities |
|------|-------------|
| **Reporter** | Submit reports, join events, earn points, upvote |
| **Authority** | All reporter abilities + update report statuses, manage cleanups |
| **Admin** | Full system control, user management, point adjustments, analytics |

---

## 3. Current State of the Points System

### How Points Are Earned

| Action | Points | Trigger |
|--------|--------|---------|
| Submit a waste report | 10 | Report creation |
| Upload photos with report | 5 | Photos attached to report |
| Upvote a report | 1 | Per upvote given |
| Report acknowledged by authority | 5 | Status change to "acknowledged" |
| Your report gets resolved | 20 | Report marked "resolved" |
| You resolve someone's report | 15 | Resolver bonus |
| Create a cleanup event | 15 | Event creation |
| RSVP to a cleanup event | 5 | First-time RSVP |
| Complete an event (organizer) | 25 | Event marked complete |
| Attend a completed event | 10 | "Going" attendees on completion |

### System Strengths

- **Atomic point awards** — database-level function prevents race conditions
- **Duplicate prevention** — unique constraints ensure no double-counting
- **Full transaction log** — every point earned is recorded with timestamp and reason
- **Time-based leaderboards** — weekly and monthly rankings from transaction data
- **Admin overrides** — manual point adjustments with reason tracking

### The Gap

Points are earned, displayed, and ranked — but they have **no real-world value**. There is no way for a user to convert their earned points into money, airtime, data, or any tangible reward. This limits long-term engagement and makes the gamification feel hollow after initial novelty wears off.

---

## 4. Value Creation for Reporters

### 4.1 Rewards Marketplace

**Concept:** Build a dedicated `/rewards` section where users browse and redeem points for real-world rewards.

#### Reward Categories

| Reward Type | Example | Point Cost | Fulfillment Method |
|-------------|---------|------------|-------------------|
| **Airtime Top-up** | MTN/Airtel/Glo/9mobile airtime | 100 pts = N100 | VTPass or Flutterwave VTU API |
| **Data Bundles** | 500MB - 10GB data plans | 200 pts = 500MB | VTPass or Flutterwave VTU API |
| **Bank Transfer** | Direct cash to bank account | 500 pts = N500 | Paystack or Flutterwave Transfer API |
| **Gift Cards** | Jumia, Konga shopping vouchers | 1000 pts = N1,000 voucher | E-commerce partnerships |
| **Utility Payments** | Electricity (NEPA) / water bills | 500 pts = N500 credit | VTPass bill payment API |
| **Merchandise** | Branded WasteMap t-shirts, bags | 300 pts | Fulfillment partner |

#### User Flow

```
User opens /rewards
    -> Browses available rewards by category
    -> Selects a reward (e.g., "MTN 1GB Data - 400 pts")
    -> Enters phone number or account details
    -> Confirms redemption
    -> Points deducted, reward delivered instantly (or within minutes)
    -> Redemption logged in history
```

#### Why This Works

- Airtime and data have near-universal demand in Nigeria
- VTU APIs provide instant, automated fulfillment
- Low minimum redemption thresholds keep users motivated
- Transaction margins (buy wholesale, sell at point value) generate platform revenue

---

### 4.2 Tiered Membership System

**Concept:** Reward sustained engagement with escalating perks and status.

| Tier | Points Required | Badge | Perks |
|------|----------------|-------|-------|
| **Green Starter** | 0 - 99 | Seedling | Basic reporting, standard rewards |
| **Eco Warrior** | 100 - 499 | Leaf | Priority report visibility, profile badge, 1.2x point multiplier |
| **Clean Champion** | 500 - 1,999 | Tree | 1.5x point multiplier, exclusive cleanup events, early reward access |
| **Waste Hero** | 2,000+ | Globe | 2x point multiplier, direct authority communication channel, featured profile on leaderboard, VIP rewards tier |

#### Benefits

- Creates aspirational goals beyond single transactions
- Multipliers reward loyal users exponentially
- Tier badges provide social proof and bragging rights
- Featured profiles on leaderboard drive visibility

---

### 4.3 Referral Program

**Concept:** Organic growth through word-of-mouth incentives.

| Event | Referrer Reward | New User Reward |
|-------|----------------|-----------------|
| New user signs up via referral link | 5 points | 5 bonus points |
| Referred user submits first report | 20 points | 15 bonus points |
| Referred user attends first cleanup | 15 points | 10 bonus points |

#### Implementation

- Each user gets a unique referral code/link (e.g., `wastemap.ng/join/ABC123`)
- Referral tracked via `referred_by` field on profiles table
- Milestone-based rewards prevent abuse (actual engagement required)
- Referral leaderboard shows top recruiters

---

### 4.4 Weekly & Monthly Challenges

**Concept:** Time-limited missions that create urgency and recurring engagement.

#### Example Challenges

| Challenge | Duration | Reward |
|-----------|----------|--------|
| "Report 5 waste sites" | Weekly | 50 bonus points |
| "Attend 2 cleanup events" | Monthly | 100 bonus points |
| "Get 10 upvotes on your reports" | Weekly | 30 bonus points |
| "Report waste in 3 different categories" | Monthly | 75 bonus points |
| "Invite 3 friends who submit reports" | Monthly | 150 bonus points |

#### Benefits

- Drives consistent daily/weekly activity
- Introduces variety beyond standard point earning
- Can be themed around environmental awareness days
- Creates anticipation and habit formation

---

### 4.5 Achievement Badges & Social Sharing

| Badge | Criteria | Social Value |
|-------|----------|-------------|
| "First Report" | Submit first waste report | Shareable to WhatsApp, Twitter, Instagram |
| "Neighborhood Guardian" | 10 reports in same area | Local recognition |
| "Event Organizer" | Organize 3 cleanup events | Community leadership |
| "Streak Master" | Report waste 7 days in a row | Dedication recognition |
| "Impact Maker" | 5 of your reports resolved | Tangible change proof |

- Shareable badge cards for social media amplify platform awareness
- Each share is free marketing and user acquisition

---

## 5. Value Creation from Waste

### 5.1 Waste Collector Marketplace

**The Biggest Revenue Opportunity**

**Concept:** Connect waste reporters with registered waste collection businesses and recyclers, creating a two-sided marketplace.

#### New User Role: Collector

| Feature | Description |
|---------|-------------|
| **Collector Dashboard** | View waste reports by category, location, and volume |
| **Bid System** | Collectors bid on waste pickups, specifying price and timeline |
| **Route Optimization** | Cluster nearby reports for efficient collection runs |
| **Verification** | Before/after photos confirm pickup completion |
| **Ratings** | Reporters rate collectors; collectors build reputation |

#### Revenue from Each Transaction

```
Reporter submits waste report
    -> Waste categorized (e.g., "Electronic waste - High severity")
    -> Registered collectors see the report
    -> Collector places bid: "I'll pick up for N2,000"
    -> Reporter accepts bid (or auto-match for free pickups)
    -> Collector picks up waste, uploads proof
    -> Reporter confirms completion
    -> Platform takes 10-15% commission
    -> Reporter earns bonus points + optional revenue share
```

#### Why This Is Valuable

- **E-waste** contains gold, copper, aluminum — recyclers pay for it
- **Construction waste** (concrete, metal) has resale value
- **Organic waste** can be composted and sold
- **PET plastic bottles** are actively purchased by recycling companies
- Nigeria's waste management market is growing rapidly
- Existing waste data (categories, locations, severity) makes matching efficient

#### Market Size Context

- Nigeria generates over 32 million tons of solid waste annually
- Less than 30% is formally collected
- The informal waste sector employs millions
- Formalizing connections between reporters and collectors creates massive value

---

### 5.2 Government & Authority Data Partnerships

**Concept:** Package WasteMap's data intelligence as a subscription product for government agencies.

#### Data Products

| Product | Description | Target Customer | Pricing Model |
|---------|-------------|----------------|---------------|
| **Waste Heatmap API** | Real-time density map of waste reports | State Environmental Agency (AEPB) | Monthly subscription |
| **Trend Reports** | Weekly/monthly waste trend analysis by area, category, severity | Local Government Areas (LGAs) | Per-report or subscription |
| **Resolution Analytics** | Cleanup efficiency metrics, response times, bottleneck identification | Government planning departments | Annual license |
| **Predictive Hotspots** | ML-based prediction of future illegal dumping zones | Urban planning agencies | Premium subscription |
| **Impact Reports** | Before/after documentation of resolved sites | Environmental ministries, donors | Per-report |

#### Value Proposition for Government

- **Cost reduction**: Prioritize cleanup resources based on data instead of guesswork
- **Accountability**: Track which areas are underserved
- **Planning**: Identify where to place new waste bins, collection routes, transfer stations
- **Public reporting**: Demonstrate environmental progress to constituents
- **Compliance**: Meet federal waste management reporting requirements

#### Implementation

The platform already has:
- `dashboard_stats` and `admin_stats` database views
- 30-day trend data
- Category and severity breakdowns
- Geographic coordinates for all reports

Package these into a dedicated **Government Portal** at `/authority-dashboard` with:
- Advanced filtering by LGA, ward, date range
- Exportable PDF/CSV reports
- API access for integration with existing government systems
- Custom alerts for new critical-severity reports

---

### 5.3 Corporate Sponsorship Program

**Concept:** Enable companies to sponsor cleanup activities for CSR visibility.

#### Sponsorship Tiers

| Tier | Investment | Benefits |
|------|-----------|----------|
| **Bronze Sponsor** | N500,000/quarter | Logo on sponsored cleanup events, mention in app |
| **Silver Sponsor** | N1,500,000/quarter | Bronze + sponsor specific rewards (branded airtime), monthly impact report |
| **Gold Sponsor** | N3,000,000/quarter | Silver + exclusive branded cleanup events, featured partner page, social media co-promotion |
| **Platinum Sponsor** | N5,000,000+/quarter | Gold + naming rights on leaderboard tier, direct CSR impact dashboard, press release collaboration |

#### How It Works

```
Company signs sponsorship agreement
    -> Funds deposited into WasteMap rewards pool
    -> Company logo appears on sponsored rewards:
       "This 1GB data reward is powered by [Company Name]"
    -> Company receives monthly impact report:
       "Your sponsorship funded 500 rewards,
        motivating 200 cleanup reports this month"
    -> Company uses impact data for CSR reporting and PR
```

#### Target Companies

- Telecommunications (MTN, Airtel, Glo) — natural fit for airtime/data rewards
- FMCG companies (Nestle, Unilever, Coca-Cola) — packaging waste responsibility
- Banks (GTBank, Access, First Bank) — community investment mandates
- Oil & gas companies — environmental offset programs
- Tech companies — sustainability commitments

---

### 5.4 Carbon Credit Integration

**Concept:** Quantify the environmental impact of waste cleanups and monetize through carbon credit markets.

#### How It Works

1. **Measure**: Track volume and type of waste diverted from open burning/dumping
2. **Calculate**: Convert to CO2 equivalent avoided (open burning of 1 ton of waste produces ~1.1 tons of CO2)
3. **Verify**: Partner with certification body (Gold Standard, Verra, or local equivalent)
4. **Sell**: List verified carbon credits on voluntary carbon markets
5. **Share**: Revenue split — platform retains 60%, top reporters share 40%

#### Potential Scale

- If WasteMap facilitates cleanup of 1,000 tons of waste per year
- That's approximately 1,100 tons of CO2 avoided
- At $5-15 per carbon credit (voluntary market)
- Annual revenue potential: $5,500 - $16,500 from credits alone
- Grows exponentially with user base and verified cleanups

#### Long-term Value

- Positions WasteMap as a climate-tech platform
- Attracts impact investors and climate funds
- Opens doors to international grant funding
- Creates a measurable, sellable environmental impact story

---

### 5.5 Recycling Revenue Sharing

**Concept:** When collected waste has resale value, share proceeds with the original reporter.

| Waste Type | Approximate Value (per kg) | Reporter Share |
|------------|---------------------------|----------------|
| PET Plastic | N80 - N150 | 20% |
| Aluminum Cans | N200 - N400 | 20% |
| Copper (from e-waste) | N2,000 - N4,000 | 15% |
| Scrap Iron/Steel | N50 - N100 | 20% |
| Paper/Cardboard | N30 - N60 | 25% |
| Glass | N20 - N40 | 25% |

#### Benefits

- Incentivizes accurate waste categorization and volume estimation
- Creates direct financial motivation beyond points
- Builds circular economy awareness
- Revenue share deposited as wallet balance or converted to points

---

## 6. Revenue Model Summary

### Revenue Streams

| Stream | Source | Type | Estimated Potential |
|--------|--------|------|-------------------|
| **Collector Marketplace Commissions** | 10-15% fee on each waste pickup transaction | Transaction-based | High |
| **Government Data Subscriptions** | Monthly/annual fees for waste intelligence dashboard | Recurring | Medium-High |
| **Corporate Sponsorships** | Quarterly sponsorship packages | Recurring | Medium-High |
| **VTU Margin** | Spread between wholesale and retail airtime/data cost | Per-transaction | Low-Medium |
| **Carbon Credits** | Sale of verified carbon offsets | Periodic | Medium (grows over time) |
| **Premium Collector Features** | Priority listing, analytics, route optimization for collectors | Subscription | Medium |
| **Recycling Revenue Share** | Platform cut from waste resale | Transaction-based | Medium |
| **API Access** | Third-party access to anonymized waste data | Subscription | Low-Medium |

### Cost Structure

| Cost | Description | Frequency |
|------|-------------|-----------|
| VTU API costs | Wholesale airtime/data purchases for rewards | Per redemption |
| Payment processing | Paystack/Flutterwave fees (1.5%) | Per transaction |
| Supabase hosting | Database, auth, storage | Monthly |
| Vercel hosting | Frontend deployment | Monthly |
| Carbon credit verification | Third-party auditing | Annual |
| Customer support | User and collector support | Monthly |

### Break-Even Scenario

With 5,000 active reporters and 50 registered collectors:
- ~2,000 reward redemptions/month at N200 avg (VTU margin: ~N40,000/month)
- ~200 collector pickups/month at N3,000 avg (Commission: ~N90,000/month)
- 2 corporate sponsors at Silver tier (N3,000,000/quarter = N1,000,000/month)
- 1 government subscription (N500,000/month)

**Projected Monthly Revenue: ~N1,630,000**

---

## 7. Implementation Roadmap

### Phase 1: Rewards Marketplace (Weeks 1-4)

**Goal:** Give points real value. Immediate user engagement boost.

| Task | Details |
|------|---------|
| Design rewards database schema | `rewards` and `redemptions` tables |
| Integrate VTPass API | Airtime and data bundle purchases |
| Build `/rewards` page | Browse, select, redeem flow |
| Build redemption history | `/profile/redemptions` section |
| Add phone number to profiles | Required for airtime/data delivery |
| Implement point deduction logic | Atomic deduction with rollback on failure |
| Admin rewards management | Create/edit/disable rewards, view redemption logs |

**Deliverables:**
- Users can redeem points for MTN/Airtel/Glo/9mobile airtime and data
- Full redemption history with status tracking
- Admin panel for managing reward catalog

---

### Phase 2: Engagement & Growth (Weeks 5-8)

**Goal:** Drive user acquisition and retention.

| Task | Details |
|------|---------|
| Tiered membership system | Badges, multipliers, tier progression UI |
| Referral system | Unique codes, tracking, milestone rewards |
| Weekly challenges | Challenge engine, progress tracking, bonus awards |
| Achievement badges | Badge catalog, unlock logic, social sharing cards |
| Push notifications | Notify for challenge progress, tier upgrades, new rewards |

**Deliverables:**
- Users see their tier and progress toward next tier
- Referral links generate and track new signups
- Weekly challenges visible on dashboard
- Shareable achievement cards

---

### Phase 3: Waste Marketplace & Revenue (Weeks 9-16)

**Goal:** Connect waste to collectors. Start generating revenue.

| Task | Details |
|------|---------|
| Collector role & onboarding | New role, business registration, verification |
| Collector dashboard | Browse reports, filter by category/location, bid system |
| Bidding & matching system | Collectors bid, reporters accept, platform mediates |
| Pickup verification | Before/after photos, reporter confirmation |
| Payment processing | Paystack integration for collector payments, commission deduction |
| Rating system | Two-way ratings after completed pickups |
| Corporate sponsorship portal | Sponsor registration, impact tracking, logo placement |

**Deliverables:**
- Registered collectors can browse and bid on waste pickups
- Payment flow with automatic commission deduction
- Corporate sponsors can sign up and track impact
- Rating system builds trust in marketplace

---

### Phase 4: Data & Scale (Weeks 17-24)

**Goal:** Monetize data. Pursue carbon credits. Scale nationally.

| Task | Details |
|------|---------|
| Government data portal | Advanced analytics dashboard, API endpoints, export tools |
| Carbon credit tracking | Volume estimation on reports, CO2 calculation engine |
| Recycling revenue sharing | Track waste resale, calculate and distribute reporter share |
| Multi-city expansion | Configurable city centers, regional leaderboards |
| Mobile app (React Native) | Native experience for field reporters |
| Predictive analytics | ML model for dumping hotspot prediction |

**Deliverables:**
- Government agencies subscribe to data dashboard
- Carbon offset calculations attached to cleanup events
- Platform operational in 3+ Nigerian cities
- Mobile app in app stores

---

## 8. Technical Architecture for New Features

### New Database Tables

```
rewards
├── id (UUID)
├── name (text) — "MTN 1GB Data Bundle"
├── description (text)
├── category (enum: airtime, data, bank_transfer, gift_card, utility, merchandise)
├── point_cost (integer)
├── provider (text) — "vtpass", "flutterwave", "manual"
├── provider_config (jsonb) — API-specific parameters
├── is_active (boolean)
├── stock (integer, nullable) — for limited rewards
├── tier_required (enum, nullable) — minimum tier to redeem
├── created_at, updated_at

redemptions
├── id (UUID)
├── user_id (FK -> profiles)
├── reward_id (FK -> rewards)
├── points_spent (integer)
├── status (enum: pending, processing, completed, failed, refunded)
├── provider_reference (text) — external transaction ID
├── delivery_details (jsonb) — phone number, account, etc.
├── created_at, completed_at

referrals
├── id (UUID)
├── referrer_id (FK -> profiles)
├── referred_id (FK -> profiles)
├── referral_code (text, unique)
├── status (enum: signed_up, first_report, first_event)
├── created_at

challenges
├── id (UUID)
├── title (text)
├── description (text)
├── action_type (text) — "report_created", "event_joined", etc.
├── target_count (integer)
├── bonus_points (integer)
├── start_date, end_date
├── is_active (boolean)

user_challenges
├── user_id (FK -> profiles)
├── challenge_id (FK -> challenges)
├── progress (integer)
├── completed (boolean)
├── completed_at (timestamp)

collector_profiles
├── user_id (FK -> profiles)
├── business_name (text)
├── business_registration (text)
├── waste_categories (array) — categories they handle
├── service_area_radius (integer) — km from their location
├── latitude, longitude
├── rating (decimal)
├── total_pickups (integer)
├── is_verified (boolean)

pickup_bids
├── id (UUID)
├── report_id (FK -> reports)
├── collector_id (FK -> profiles)
├── bid_amount (integer) — in Naira
├── estimated_time (text)
├── status (enum: pending, accepted, rejected, completed, cancelled)
├── platform_fee (integer)
├── created_at

sponsorships
├── id (UUID)
├── company_name (text)
├── tier (enum: bronze, silver, gold, platinum)
├── logo_url (text)
├── start_date, end_date
├── budget_allocated (integer)
├── budget_spent (integer)
├── is_active (boolean)
```

### New API Integrations

| Service | Purpose | API |
|---------|---------|-----|
| **VTPass** | Airtime, data, utility bill payments | REST API with webhook callbacks |
| **Paystack** | Bank transfers, collector payments, payment processing | REST API + webhooks |
| **Flutterwave** (alternative) | Same as Paystack, broader coverage | REST API |
| **Google Maps Platform** | Route optimization for collectors | Directions API |
| **Twilio / Termii** | SMS notifications for reward delivery | SMS API |

---

## 9. Key Metrics & Success Indicators

### User Engagement Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Monthly Active Reporters | 2,000 | 10,000 |
| Reports per month | 5,000 | 25,000 |
| Cleanup events per month | 50 | 200 |
| Reward redemptions per month | 1,000 | 5,000 |
| Referral signups per month | 500 | 2,500 |
| Average points per active user | 150 | 300 |

### Revenue Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Monthly revenue | N800,000 | N3,000,000 |
| Registered collectors | 20 | 100 |
| Collector pickups per month | 100 | 500 |
| Corporate sponsors | 2 | 5 |
| Government subscriptions | 1 | 3 |

### Impact Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Waste sites reported | 15,000 | 75,000 |
| Reports resolved | 5,000 | 30,000 |
| Tons of waste collected | 500 | 3,000 |
| CO2 equivalent avoided | 550 tons | 3,300 tons |
| Cities covered | 1 (Abuja) | 3+ |

---

## 10. Call to Action

### The Vision

WasteMap transforms from a **reporting tool** into a **waste economy platform** — where every piece of litter reported becomes an opportunity for income, environmental impact, and community building.

### Immediate Next Steps

1. **Approve Phase 1 scope** — Rewards marketplace with VTPass integration
2. **Secure initial funding** for reward pool (seed with N500,000 for first 3 months of rewards)
3. **Identify 2-3 pilot corporate sponsors** to fund rewards and validate the sponsorship model
4. **Engage AEPB (Abuja Environmental Protection Board)** for government data partnership pilot
5. **Begin collector outreach** — identify 10 waste collection businesses in Abuja for marketplace pilot

### The Bottom Line

| | Today | In 12 Months |
|--|-------|-------------|
| Points | Vanity metric | Real currency convertible to airtime, data, cash |
| Waste reports | Data sitting in database | Revenue-generating marketplace listings |
| User base | Reporters with no incentive to stay | Engaged community earning real value |
| Revenue | Zero | N3,000,000+/month from multiple streams |
| Impact | Unmeasured | Verified carbon offsets, tons of waste diverted |

**WasteMap is not just an app. It is infrastructure for a cleaner Nigeria — and a sustainable business.**

---

*Document prepared for WasteMap stakeholder review.*
*March 2026*
