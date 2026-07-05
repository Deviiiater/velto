# 🛸 Velto: India's AI-Powered Hyperlocal Operating System

> **Everything around you. Delivered intelligently.**

Velto is an ultra-premium, next-generation hyperlocal super app ecosystem combining food delivery, grocery, medicine, meat, tiffin, dine-out, local courier booking, and electric fleet telemetry into a single unified product suite. Inspired by the design languages of Apple, Nothing OS, Stripe, and Tesla, Velto elevates hyperlocal convenience to an art form.

---

## ⭐️ Overall Vision

Velto is positioned not as a mere delivery utility, but as **India's AI-Powered Hyperlocal Operating System**. The experience is cohesive, intelligent, and premium, prioritizing minimalism, rich micro-interactions, and deep AI-first integration over cluttered banner ads.

### 🌟 Core Product Pillars

1. **🧠 AI-First Everywhere**
   * **AI Order Builder**: Builds complete, optimized baskets and applies coupons for prompts like *"I need dinner for 5 people under ₹1200"*.
   * **Contextual Suggestions**: Intelligently recommends medicine, soup, or fruits when a user searches *"I'm sick"*, or splits/suggests snacks when hosting guests.
   * **Voice Ordering**: Dynamic voice-guided commerce flow (*"Send milk to my home"* → verify → pay → done).

2. **🕒 Live Dynamic Context**
   * **Morning**: Coffee, fresh breakfast, milk, newspaper.
   * **Afternoon**: Office lunch, light meals, groceries.
   * **Evening**: Tea, high-tea snacks, active dinner plans.
   * **Night**: Late-night canteens, emergency medicines, desserts.
   * **Weather Integration**: Rain triggers hot chai & pakodas, heatwaves promote cold drinks & fresh mangoes, winters highlight cozy soups & hot coffee.

3. **🎓 Student Mode & Night Canteens**
   * **Budget Combos**: Curated meals under ₹99 and ₹149 tailored for hostels.
   * **Late-Night Delivery & Shared Orders**: Unlocks late-night canteens, library drops, energy drinks, and shared hostel cart splitting.

4. **💳 Next-Gen Smart Wallet**
   * Premium wallet subsystem displaying cashbacks, reward coins, active coupons, and scratchcards in a sleek Apple Wallet-inspired interface.

5. **🛵 Cinematic Delivery Tracking**
   * Real-time flight-telemetry dashboard for active deliveries, tracking rider battery levels, vehicle speeds, animated routes, and food container temperatures.

---

## 📂 Project Structure

This monorepo is divided into two primary execution layers:

### 1. 🤖 Velto Telemetry Control Room (Root Directory)
* **Role**: Fleet telemetry control deck for autonomous ground delivery units ("e-robos").
* **Tech Stack**: React, Vite, TailwindCSS, Supabase.
* **Location**: `./src` (Vite workspace root).
* **High-Fidelity Enhancements**: Live fleet stats (battery, speed, temperature), live simulation logs, system override controls, and diagnostic sensors.

### 2. 🛒 Velto Super App PWA (`quickkart-pwa/`)
* **Role**: Customer-facing mobile super app and integrated merchant/staff panels.
* **Tech Stack**: Next.js (App Router, Turbopack), TypeScript, TailwindCSS, Vanilla CSS, Supabase, Razorpay API.
* **Location**: `./quickkart-pwa`.
* **Integrated Consoles**:
  * **Chef's Console (Velto Kitchen)**: `/kitchen` (Syncs meal prep & tiffins).
  * **Store Manager Portal**: `/store-panel`
  * **Rider Dashboard**: `/rider-panel`
  * **Warehouse Manager**: `/warehouse`
  * **Admin Control Center**: `/admin` (Glassmorphism analytics, funnels, and retention charts).

---

## ⚙️ Local Development & Setup

### ⚡ 1. Run Telemetry Control Room (Root App)
```bash
# Install root node modules
npm install

# Start Vite server
npm run dev
```
Uplink console defaults to [http://localhost:5173](http://localhost:5173).

### 🛒 2. Run Velto Super App (QuickKart PWA)
```bash
# Change directory
cd quickkart-pwa

# Install packages
npm install

# Start Next.js development server
npm run dev
```
Super App defaults to [http://localhost:3000](http://localhost:3000).

### Environment Configuration (`quickkart-pwa/.env.local`)
Configure the project connection parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Schema Initialization
Use the queries inside [quickkart-pwa/schema.sql](file:///Users/xtreamdeveloper/Desktop/e-robo/quickkart-pwa/schema.sql) in your Supabase SQL editor to create the core tables, then run:
```bash
node src/lib/populate-products.js
```

---

## 📐 Brand & Design Tokens

* **Primary Background**: Deep Space dark mode (`#070B14`, `#09090B`)
* **Primary Gradient**: Sunrise Gold (`#FF5F1F` → `#FF8A00`)
* **Secondary Accent**: Electric Purple (`#7C3AED`) & Neon Pink (`#EC4899`)
* **Radii & Layout**: Large pill rounded corners (`24px` to `32px`), Glassmorphism cards with frosted glass blur, and floating action docks.
