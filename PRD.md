# DestiPicker: Zero-Budget MVP PRD

## 1. Executive Summary

**Product Name:** DestiPicker  
**MVP Version:** 1.0-Zero  
**Launch Date:** January 14, 2026  
**Budget:** $0 (100% free tools)  
**Goal:** $100 revenue Week 1 → $1K/month  

**Ultra-Lean MVP (3 screens):** Auth → Decision → Map. 3 uses/day free, $1.99 unlock unlimited. 

**No-Code Stack (Deploy Tomorrow):**
```
Frontend: Vercel + Next.js (free tier)
Backend: Supabase (free auth + PostgreSQL)
Maps: Google Maps Embed (free)
Payments: Stripe Checkout (0% until revenue)
```

## 2. MVP Scope (Launch Tomorrow)

### ✅ **INCLUDE (Core Loop - 80% Revenue Driver)**
```
1. Google Auth (30sec setup)
2. Home: "What you want?" → Cafe/Food (dropdown)
3. Budget: $5-50 slider 
4. Radius: 50km auto (user location)
5. MAGIC → 2 venues (4+⭐, budget match)
6. Tap → Google Map + "Unlock unlimited? $1.99"
```

### ❌ **CUT (Post-Revenue Features)**
- Outfit picker 
- Menu scanner 
- Profile/birthday (nice-to-have)
- Multiple categories (add Food → Shopping later)

## 3. Revenue-First Design

```
3 Free Uses/Day → WALL → $1.99 Unlock (Stripe)
                ↓
           20% Convert = $400/1000 users
```

**Paywall Psychology:**
```
Use 1/3: "2 left! 😊"
Use 3/3: "Decision magic blocked! 
          Unlock unlimited forever: $1.99"
         [Big Green Buy Button]
```

**Pricing:** $1.99 one-time (not subscription - Filipinos prefer). 91% margin after Stripe.

## 4. Zero-Budget Tech Stack (Deploy 4 Hours)

| Component | Tool | Setup Time | Why Free |
|-----------|------|------------|----------|
| **Frontend** | Next.js 15 + Tailwind | 1hr | Vercel free hosting |
| **Auth** | Supabase Google OAuth | 30min | Free 10K users |
| **Database** | Supabase PostgreSQL | 15min | Free 500MB |
| **Maps** | Google Maps Embed | 10min | Free 28K loads/mo |
| **Payments** | Stripe Checkout | 30min | 0% until $1 revenue |
| **Deploy** | Vercel 1-click | 5min | Unlimited bandwidth |

**Total Build Time:** 4 hours solo.

## 5. Copy-Paste Code Structure

```
pages/
├── index.js     (Home + Decision)
├── api/decide.js (Supabase + Google Places)
└── success.js   (Stripe webhook)

components/
├── Paywall.jsx
└── VenueCard.jsx
```

**Core API Logic (api/decide.js):**
```js
// Google Places "nearbysearch" → filter price_level <= budget → random 2
const places = await fetchGooglePlaces(lat, lng, budget);
const picks = places.results
  .filter(place => place.rating >= 4)
  .sort(() => Math.random() - 0.5)
  .slice(0, 2);
```

## 6. Launch Checklist (Tomorrow)

```
☐ 9AM: Supabase project + Google OAuth
☐ 10AM: Next.js boilerplate + Tailwind
☐ 11AM: Decision API + Maps embed
☐ 12PM: Stripe Checkout + Paywall
☐ 1PM: Vercel deploy
☐ 2PM: Test 10 decisions
☐ 3PM: Launch Twitter/Reddit Manila
```

## 7. Day 1 Revenue Rocket

**Free Traffic (Zero $):**
```
1. Reddit: r/phinvest, r/Manila, r/beermoneyph
   "Indecisive? I built DestiPicker - pick cafe under ₱500"
2. Twitter: #ManilaEats #PinoyFoodie (100RTs easy)
3. FB Groups: Manila Foodies (50K members)
4. TikTok: 15sec "Watch AI pick my ₱200 lunch!"
```

**Conversion Target:** 1000 visitors → 20% try → 20% pay = **$40 Day 1**.

## 8. Success Triggers (Scale Plan)

```
$100 revenue → Add outfit picker
$500 revenue → Menu OCR  
$1K revenue → iOS App Store
```

**North Star Metric:** Revenue per visitor = $0.04 target.

***

**Tomorrow's MVP is surgically focused: 1 category (Food), 1 paywall, 3 screens.** Launch, collect $50, then expand. 

UI Design Specifications: Premium Matcha
1. Design Philosophy
"Serene, Organic, Premium." The design mimics the ritual of matcha: calming, precise, and earthy. It avoids harsh contrasts in favor of soft, creamy backgrounds and deep, rich accents.

2. Color Palette
Primary Colors
Color Name	Hex Code	Usage
Matcha Creme	#F9F7F2	Main Background. A warm off-white/cream, softer than pure white.
Deep Ceremonial	#2C4C3B	Primary Text & Headings. A deep, dark forest green replacing black.
Fresh Matcha	#88B04B	Primary Action / Brand Color. Vibrant but natural green for buttons and active states.
Secondary & Accents
Color Name	Hex Code	Usage
Sage Mist	#D0E1D4	Secondary Backgrounds / Cards. A very light green tint for surfaces.
Roasted Hojicha	#6D5C52	Secondary Text / Subtitles. A warm brown-grey for softer text.
Bamboo	#E8DCCA	Borders / Separators. A warm beige for subtle division.
3. Typography
Headings
Font Family: Playfair Display (Serif)

Weight: 700 (Bold) / 600 (Semi-Bold)
Character: Elegant, high-contrast, editorial feel.
Why: Evokes a sense of tradition and premium quality.
Body Copy
Font Family: Inter or Lato (Sans-serif)

Weight: 400 (Regular) / 500 (Medium)
Character: Clean, legible, modern.
Why: ensures readability against the creamy background without feeling sterile.
4. Components & Styling
Buttons ("The Mochi Button")
Shape: Fully rounded pills (Border-radius: 999px).
Style:
Primary: Background Fresh Matcha (#88B04B), Text Matcha Creme (#F9F7F2). Subtle drop shadow 0 4px 12px rgba(136, 176, 75, 0.4).
Secondary: Border Deep Ceremonial (#2C4C3B), Text Deep Ceremonial. Transparent background.
Cards & Surfaces
Background: White (#FFFFFF) or Sage Mist (#D0E1D4) with very low opacity (Glassmorphism).
Border: Thin, subtle border 1px solid #E8DCCA.
Shadow: Soft, diffuse diffusion using colored shadows. 0 10px 30px -10px rgba(44, 76, 59, 0.08).
Border Radius: Large, friendly curves (24px to 32px).
Imagery & Icons
Icons: Thin stroke icons (1.5px), rounded endpoints. Color: Deep Ceremonial.
Vibe: Nature-inspired, soft photography, matte textures.
5. Layout & Spacing
Whitespace: Generous. mimicking a zen garden.
Grid: Fluid, responsive, centered content.
Margins: Double standard spacing (e.g., 32px or 48px gaps) to let elements breathe.
