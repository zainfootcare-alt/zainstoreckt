# 👟 Zain Footwear POS & CRM System

<div align="center">

![Zain Footwear POS & CRM](https://img.shields.io/badge/Zain%20Footwear-POS%20%26%20CRM-f97316?style=for-the-badge&logo=shopify&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-f97316?style=for-the-badge&logo=pwa&logoColor=white)

<p align="center">
  <b>A simple, lightning-fast, Khatabook-inspired Point of Sale (POS), Customer & Supplier Party Ledger, Fullscreen Calculator POS, Estimates-to-Sales, Attendance & Payroll, and Store Operations system built for modern footwear retail.</b>
</p>

[✨ Core Principles](#-core-product-principles) • [🖥️ Detailed UI Walkthrough](#️-detailed-ui-walkthrough) • [🏗️ Architecture](#️-technical-architecture--tech-stack) • [🚀 Quick Start](#-getting-started) • [🔑 Default Accounts](#-default-accounts--role-permissions) • [📦 Database Schema](#-database-schema--backend)

---

</div>

## 📖 Overview

**Zain Footwear POS & CRM** is designed on the core principle: **"SHOW LESS, DO MORE."**

Instead of overwhelming shop owners with enterprise ERP dashboards and complex charts, Zain POS gives a retail footwear store owner or cashier an instantly understandable system with zero training required.

### 🌟 5 Primary Navigation Tabs
1. **🏠 HOME**: 3-second understandable summary (Today's Sales, Cash / Online / Due split, 4 large Quick Actions, latest 5 transactions).
2. **👥 PARTIES**: Khatabook-style customer & party ledger with plain language (*"You will receive ₹2,000"*, *"You will give ₹1,500"*, *"Settled"*), 1-tap `[ + Sale ]` & `[ + Payment ]`, and chronological timelines.
3. **🧮 SALE**: Fullscreen calculator-first POS with large touch-friendly numpad (`7 8 9 ÷`, `4 5 6 ×`, `1 2 3 -`, `0 . C +`), live math evaluation, and streamlined split payments.
4. **📄 ESTIMATES**: Create price quotes, share on WhatsApp, and **1-click convert into Sales** without automatic invoice clutter.
5. **⋯ MORE**: Clean, categorized hub housing Expenses, Suppliers, Staff, Cash Register Drawer Shifts, Finance/P&L, and Settings.

---

## 🎯 Core Product Principles

* **Simplicity & Zero Training**: A first-time user can make a sale within 5 seconds of opening the application.
* **Fullscreen Calculator-First**: The calculator occupies the primary screen with real-time arithmetic formula evaluation.
* **Streamlined Split Payments**: Clean 3-way split inputs (`Cash` + `Online` + `Due = Total`) with automatic reconciliation.
* **No Forced Invoice Clutter**: Completed sales simply confirm the transaction and let the cashier tap `Done` to return immediately to the calculator. Thermal receipt printing and WhatsApp sharing are clean secondary options.
* **Human-Readable Party Ledgers**: Clear balances (*"You will receive"*, *"You will give"*, *"Settled"*) without double-entry jargon on primary screens.
* **Offline-First & PWA Ready**: Operates with zero latency offline, storing records locally and synchronizing seamlessly with Supabase PostgreSQL cloud backend.

---

## 🖥️ Detailed UI Walkthrough

### 1. 🏠 Home / Dashboard (`/app/dashboard`)
* **Store Header**: Clean Zain Footwear brand title with live date (*Today, 26 Aug*).
* **Compact Sales Summary**:
  * **Today's Sales**: Large readable amount (e.g. `₹12,500`).
  * **3-Way Payment Split**: Compact cards for `Cash: ₹7,000`, `Online: ₹5,500`, and `Due: ₹0`.
* **4 Large Quick Action Buttons**:
  * `[ + New Sale ]` (Prominent orange highlight, opens Fullscreen Calculator)
  * `[ Estimate ]` (Create and share quotations)
  * `[ + Payment ]` (Quick modal to receive customer money and update party ledger)
  * `[ Parties ]` (Open customer ledger list)
* **Recent Activity**: Clean list showing only the latest 5 transactions with customer name, payment mode badge, timestamp, amount, and a `View All` link.

---

### 2. 🧮 Fullscreen Calculator POS (`/app/pos`)
* **Optional Customer Quick-Select**: 1-tap dropdown to pick from registered Parties or enter customer name/phone.
* **Large Digital Amount Display**: Shows active mathematical expression (e.g. `499 + 799 + 599`) and computed live total (`₹1,897`).
* **Tactile High-Contrast Keypad**:
  * `[ 7 ] [ 8 ] [ 9 ] [ ÷ ]`
  * `[ 4 ] [ 5 ] [ 6 ] [ × ]`
  * `[ 1 ] [ 2 ] [ 3 ] [ - ]`
  * `[ 0 ] [ . ] [ C ] [ + ]`
  * `[ + Add Item to Bill ]` and `[ ⌫ Backspace ]`
* **Bill Summary**: Real-time Subtotal, Discount (₹ input), and Total Payable.
* **Action**: Large `[ Continue to Payment (₹1,897) → ]` button.

---

### 3. 💳 Simplified Split Payment Flow
* **Total Payable Display**: Clearly shows `₹1,897`.
* **1-Tap Quick Fill Buttons**: `[ 💵 All Cash ]`, `[ 📱 All Online ]`, `[ ⏳ All Due ]`.
* **3 Split Amount Inputs**:
  * `💵 Cash`: [ ₹1,000 ]
  * `📱 Online / UPI`: [ ₹897 ] (with optional UPI / Card / Bank toggle)
  * `⏳ Balance Due (Credit)`: [ ₹0 ] (automatically links to customer's Party Ledger)
* **Reconciliation Indicator**: Instant check ensuring `Cash + Online + Due == Sale Total`.
* **Complete Action**: 1-tap `[ Complete Sale ]`.

---

### 4. ✅ Sale Completed Screen
* **Confirmation Badge**: Clean green checkmark with Sale `#REC-1025` and total summary.
* **Primary Action**: `[ Done • Next Sale ]` immediately resets state and returns to a fresh calculator in 1 millisecond.
* **Optional Secondary Actions**:
  * `[ 🖨️ Print Receipt ]`: Opens clean 80mm/58mm thermal receipt preview and print dialog.
  * `[ 💬 WhatsApp ]`: Direct `https://wa.me/` link delivering a clean digital invoice to customer.

---

### 5. 👥 Parties / Customer Ledger (`/app/parties`)
* **Receivable / Payable Summary Ribbon**:
  * **You will receive**: `₹5,500` (green)
  * **You will give**: `₹1,500` (slate/rose)
* **Search Bar**: Prominent search by customer name or phone number.
* **Party Row Statuses**:
  * *Rahul Sharma* → `You will receive ₹2,000`
  * *Amit Patel* → `You will give ₹1,500`
  * *Neha Verma* → `Settled`
* **Party Detail View (`/app/parties/:customerId`)**:
  * Net Balance card with plain-language status.
  * Primary Actions: `[ + New Sale ]` & `[ + Receive Payment ]`.
  * Chronological transaction timeline (`Sale +₹3,000`, `Payment -₹1,000`, `Balance ₹2,000`).
  * Direct 1-tap WhatsApp balance reminder button.
  * Receive Payment modal that updates customer balance, creates ledger entry, and credits cash/UPI accounts.

---

### 6. 📄 Estimates & Quotations (`/app/estimates`)
* **Status Filter Tabs**: `All`, `Draft`, `Sent`, `Accepted`, `Converted`.
* **Create Estimate Modal**: Customer name, phone, item rows (Name, Size, Qty, Unit Price), discount, notes, and subtotal calculation.
* **Estimate Card**: Itemized summary, created date, and WhatsApp sharing.
* **1-Click "Convert to Sale" Workflow**:
  * Clicking `[ Convert to Sale ]` opens a streamlined payment popup (Cash / Online / Due).
  * Automatically creates the sale record, updates party ledger (if due), and marks the estimate status as `Converted`.

---

### 7. ⋯ More Operations Hub (`/app/more`)
Cleanly groups all secondary store operations without cluttering everyday sales:
* **Operations**:
  * 💸 **Expenses & Petty Cash** (`/app/expenses`): Categorized expenses (Rent, Tea/Snacks, Porter, Electricity) with payment mode selection.
  * 🚚 **Suppliers & Purchases** (`/app/vendors`): Supplier directory, purchase bills with due dates, and weekly payment scheduler.
  * 👥 **Staff, Attendance & Payroll** (`/app/staff`): Employee directory, 1-click daily attendance punch (Present, Half Day, Absent, Leave), salary advances, and payroll calculation.
  * 🪙 **Cash Drawer & Shifts** (`/app/counter`): Opening shift float, physical currency denomination counter (₹500 down to ₹1 coins), and variance reconciliation.
* **Business & Intelligence**:
  * 📜 **All Sales History** (`/app/sales`): Searchable receipt history and customer directory.
  * 📈 **Finance & Profit / Loss** (`/app/finance`): P&L statements, Gross Margins, Operating Expenses, and Net Operating Margins.
  * 📊 **Reports & Tax Summary** (`/app/reports`): Category breakdown, payment mode distribution, and CSV export.
* **System**:
  * ⚙️ **User Management & Roles** (`/app/settings`): Admin, Manager, Cashier, and Finance operator management.
  * 🔔 **Alerts & Notifications** (`/app/notifications`): Operational shift and supplier alerts.

---

## 🏗️ Technical Architecture & Tech Stack

```
                                +-------------------------------------------+
                                |               Zain POS UI                 |
                                |     (React 19 + TypeScript + Tailwind)    |
                                +-------------------------------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
        +-----------------------------------+                     +----------------------------------+
        |         ShopContext Engine        |                     |        PWA Service Worker        |
        |   - Optimistic State In-Memory    |                     |   - Static Asset Caching         |
        |   - LocalStorage Fallback Layer   |                     |   - Background Manifest Config   |
        |   - Fullscreen Keypad Logic       |                     |   - Zero-Latency Mobile View     |
        |   - Khatabook Customer Ledger     |                     +----------------------------------+
        |   - Estimates & Conversion Engine |
        +-----------------------------------+
                         |
                         v
        +-----------------------------------+
        |       Supabase Cloud Client       |
        |   - Real-time PostgreSQL Sync     |
        |   - Row Level Security (RLS)      |
        |   - Stored Procedures (RPCs)      |
        +-----------------------------------+
```

### Core Technologies
* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
* **Build Tool & Dev Server**: [Vite 6.1](https://vitejs.dev/)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Routing**: [React Router DOM v7](https://reactrouter.com/)
* **Cloud Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS & PL/pgSQL RPCs)
* **Testing Suite**: [Vitest 3.0](https://vitest.dev/)
* **Progressive Web App (PWA)**: Service Worker (`sw.js`), Web App Manifest, Mobile Touch Optimization

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
* **npm** or **pnpm** or **yarn**

### 2. Installation
```bash
# Navigate to project folder
cd footwear-pos-crm

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
*(Note: If no Supabase credentials are provided, the app runs in **Local Standalone Mode** with fully functional local storage persistence).*

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Run Acceptance Tests
```bash
npm test
```

---

## 🔑 Default Accounts & Role Permissions

| Role | Username / Email | Security PIN | Access Privileges |
|---|---|---|---|
| 👑 **ADMIN** | `admin` / `admin@zainfootwear.com` | `1234` | **Full Unrestricted Access**: Home, Parties, Fullscreen Calculator POS, Estimates, Expenses, Staff, Finance & P&L, User Management. |
| 👔 **MANAGER** | `manager` / `manager@zainfootwear.com` | `5678` | **Store Operations & Approvals**: POS, Estimates, Parties, Supplier Dues, Shift Approvals, Staff Attendance & Expenses. |
| 🧮 **CASHIER** | `cashier` / `cashier@zainfootwear.com` | `1111` | **Fast Countertop Sales**: Fullscreen Calculator POS, Parties, Estimates, Shift Open & Shift Close. Sensitive P&L restricted. |
| 📑 **FINANCE** | `finance` / `finance@zainfootwear.com` | `2222` | **Accounting & Reconciliation**: Finance, P&L Statements, Party Payments, Expenses, Staff Payroll, and Tax Reports. |

---

## 📱 Progressive Web App (PWA) & Offline Usage

* **Desktop (Windows / macOS / ChromeOS)**: Install directly from the address bar or via the in-app "Install POS App" button. Launches in a dedicated chromeless window.
* **Tablet (iPad / Android Tablets)**: Touch-optimized landscape layout with large calculator buttons.
* **Mobile (iOS / Android)**: Bottom navigation bar with prominent central Sale button.
* **Offline Resiliency**: All sales, party ledger entries, and customer records are safely stored locally if connectivity drops and synchronized upon reconnection.

---

## 📄 License & Attribution

Developed with ❤️ for **Zain Footwear**. 
Built for speed, accuracy, and effortless retail management.
