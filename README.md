# 🛒 Velto Super App (QuickKart PWA)

Velto is a state-of-the-art Hyperlocal Super App combining Groceries, Cloud Kitchen, Tiffin Subscriptions, Pharmacy, Courier Logistics, Utility Bills, and Booking Services. Designed with a premium dark-mode dashboard, AI voice commerce, and real-time order tracking, Velto brings clinical-grade UI excellence and convenience to the hyperlocal delivery space.

---

## 🚀 Key Innovation Features

### 1. 🤖 AI Shopping Copilot & Voice Commerce
* **Intelligent Querying**: Allows users to type or speak complex instructions (e.g. *"Make breakfast for 4 people under ₹300"*). The AI parses items, builds your basket, optimizes cost, and recommends custom combos.
* **Voice Shortcuts**: Natural keyword trigger matching (e.g. *"order my usual groceries"*) to instantly populate historic baskets.

### 2. 🎓 Student Mode & Night Canteens
* **Budget Combos**: One-click cheap meals tailored for hostel students (e.g. *Maggie + Coke* or *Hostel Study Snacks*).
* **Night Canteen Activation**: Dynamic toggle to unlock late-night delivery services and shared hostel order splitting.

### 3. 🎯 Predictive Reordering & Auto Refills
* **Smart Reminders**: Historic pattern analysis showing evening chai banners or predicting when household goods are running out (e.g. *"You may need toothpaste in 3 days"*).
* **One-Click Cart Addition**: Add items to your active cart instantly from personalized smart notification widgets.

### 4. ⚡ Smart Delivery Clustering & Community Gig Riders
* **Cost & Carbon Reduction**: Users can select green shipping clustering options (e.g. *"Wait 8 mins and save ₹40"*).
* **Community Riders**: Connects orders to local micro-delivery gig partners, including *Local Students* and *Nearby Shopkeepers*.

### 5. 🛡️ AI Auto-Refund Engine & Family Accounts
* **Instant Support**: A automated instant refund button next to completed orders in profile history. Input your issue (e.g. *"Missing Milk"*), and the AI automatically verifies and credits your Velto Wallet.
* **Family Wallets**: Shared payment methods, emergency grocery ordering, and unified household checklists.

### 6. 👑 One India Pass Subscription
* Premium checkout upgrade providing **Free Delivery** benefits for a validity of 1 month. Platform safety fees remain untouched, keeping unit economics balanced.

---

## 🍳 Integrated Operational Consoles

The app includes dedicated isolated portals for business operations and staff roles. To prevent cross-contamination, all portals hide customer-facing navigation menus, active order tracking widgets, and shopping cart elements.

* **Chef's Console (Velto Kitchen Hub)**: `/kitchen`
  * Real-time meal preparation & active tiffin subscription scheduler.
  * Gracefully synced authentication handling to prevent browser refresh token errors.
* **Store Manager Portal**: `/store-panel`
* **Rider Dashboard**: `/rider-panel`
* **Warehouse Manager**: `/warehouse`
* **Admin Control Center**: `/admin`

---

## 🛠️ Technology Stack & Architecture

* **Core**: Next.js 16.2 (Turbopack, App Router)
* **Logic**: React, TypeScript, Context API (`AuthContext`, `CartContext`, `SettingsContext`)
* **Styling**: Vanilla CSS custom variables, TailwindCSS components for dashboard utility layouts
* **Database & Auth**: Supabase (Isolated storage keys for portal-specific local sessions)
* **Real-time Engine**: Postgres replication triggers & WebSocket polling fallback mechanisms for instant status syncing

---

## ⚙️ Local Development & Setup

### 1. Installation
Navigate to the directory and install local dependencies:
```bash
cd quickkart-pwa
npm install
```

### 2. Configure Credentials
Create a `.env.local` file in the root of `quickkart-pwa/` containing your Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Initialize Database Schema
Apply the schema queries inside [schema.sql](file:///Users/xtreamdeveloper/Desktop/e-robo/quickkart-pwa/schema.sql) in your Supabase SQL editor. This provisions users, products, orders, and AI complaints.

### 4. Seed Products
Run the database provisioner to load grocery categories, pharmaceutical items, and student combo packs:
```bash
node src/lib/populate-products.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Build Verification
To ensure all pages compile cleanly and TypeScript boundaries are validated:
```bash
npm run build
```

---

## 📂 File Layout

* `src/app/page.tsx`: Core customer landing page with AI Copilot, Student Mode, and Super Service selections.
* `src/app/cart/page.tsx`: Checkout, Delivery Clustering, and One India Pass upgrade card.
* `src/app/profile/page.tsx`: Wallet balances, past orders, and AI Auto-Refund triggers.
* `src/app/orders/[id]/page.tsx`: Dynamic tracking screen displaying contextual layouts (recharges, home services, tiffins, or physical deliveries).
* `src/components/StaffAuthGuard.tsx`: Safe authentication wrapper protecting staff dashboards and handling session token replication.
