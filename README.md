# 🖨️ PrintDedo

A modern, real-time print queue and shop management platform built for Xerox and print shops. **PrintDedo** simplifies customer document uploads, automates instant price estimation, provides a live order queue for shop owners, and offers super-admin subscription management.

---

## 🌟 Key Features

- 📄 **Instant PDF Processing & Auto-Quoting**: Automatically detects PDF page counts and calculates instant order pricing based on single/double-sided, color vs B&W, and paper size configurations.
- ⚡ **Real-Time Live Print Queue**: Shop operators receive and manage incoming print orders instantly on their interactive dashboard.
- 📱 **QR Code Quick Access**: Unique QR code generation for every shop, allowing walk-in customers to scan and upload print jobs effortlessly.
- 🔐 **Authentication & File Storage**: Secure document uploads and shop authentication powered by Supabase.
- 👑 **Super Admin & Subscription Management**: Complete admin control over registered shops, subscription plans (Free Trial, Quarterly, Half-Yearly, Yearly), and renewal tracking.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/) & [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Document Processing**: `pdf-lib` & `react-pdf`
- **QR Generation**: `react-qr-code`
- **Notifications**: `sonner`
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Project Structure

```
zerox/
├── app/
│   ├── page.tsx               # Main Landing Page
│   ├── login/                 # Shop Owner Login
│   ├── signup/                # Shop Registration
│   ├── dashboard/             # Shop Owner Live Order Queue & Settings
│   ├── shop/[shopId]/         # Customer Document Upload & Ordering Portal
│   ├── admin/                 # Super Admin Management Dashboard
│   ├── renew/                 # Subscription Renewal Page
│   └── contact-admin/         # Support & Contact Admin Page
├── lib/
│   └── supabaseClient.ts      # Supabase Client Configuration
├── supabase_subscription.sql # Database Migration & Subscription Schema
├── supabase_cleanup.sql      # Database Utility Scripts
└── public/                    # Static Assets
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js 18.x** or higher installed.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd zerox
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and configure the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAIL=admin@printdedo.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### 4. Database Setup

Execute the SQL scripts in your Supabase SQL Editor (`https://supabase.com/dashboard`):
1. Run `supabase_subscription.sql` to establish tables for shops, plans, and subscriptions.

### 5. Running the Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server with Hot Module Replacement.
- `npm run build` - Compiles and builds the application for production.
- `npm run start` - Runs the production build.
- `npm run lint` - Executes ESLint checks across the codebase.

---

## 👥 Founders

- **Omkar Varpe** ([LinkedIn](https://www.linkedin.com/in/omkar-varpe-9704742a9/))
- **Pradeep Biswas** ([LinkedIn](https://www.linkedin.com/in/pradeep-biswas-developer/))
- **Yajan Mehta** ([LinkedIn](https://www.linkedin.com/in/yajan-mehta-9220442b2/))
- **Siddhant Deshmukh** ([LinkedIn](https://www.linkedin.com/in/siddhant-deshmukh-0aa485344/))
