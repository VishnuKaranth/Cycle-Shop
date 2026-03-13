# 🏔️ Cycle-Shop: Premium E-Commerce Experience

A state-of-the-art, data-driven e-commerce platform for high-performance bicycles. Built with a focus on luxury aesthetics, real-time performance, and a robust admin management ecosystem.

## 🚀 Tech Stack

- **Monorepo Architecture**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **API**: [tRPC](https://trpc.io/) (End-to-end type safety)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **Payments**: [Stripe](https://stripe.com/)
- **Analytics**: [PostHog](https://posthog.com/) & custom internal analytics

## 🏗️ Monorepo Structure

- `apps/web`: The premium consumer-facing storefront.
- `apps/admin`: Secure, role-based management dashboard for inventory, orders, and CRM.
- `packages/api`: Shared tRPC router and backend business logic.
- `packages/database`: Prisma schema, migrations, and seed scripts.
- `packages/ui`: Shared design system and high-end React components.

## 🛠️ Getting Started

### 1. Requirements
- Node.js 20+
- A Supabase Project
- A Stripe Developer Account

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root and in `apps/web` and `apps/admin` following the structure in the Deployment Guide.

### 4. Database Setup
```bash
cd packages/database
npx prisma db push
npx prisma db seed
```

### 5. Start Development
```bash
npm run dev
```

## 🌐 Deployment

The platform is optimized for **Vercel** deployment. 

1. Connect your GitHub repository to Vercel.
2. Configure the root directory settings (Turborepo is auto-detected).
3. Add all required environment variables (see `deployment_guide.md` in artifacts).
4. Deploy!

## 🛡️ Security

- **RBAC**: Strict role-based access control for admin routes.
- **Middleware**: Server-side session verification.
- **tRPC Guards**: Protected procedures for all sensitive operations.

---
*Created with focus on performance and visual excellence.*
