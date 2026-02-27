---
name: editorial-landing-platform
description: "Build editorial-style landing pages with mentoring/enrollment forms, admin dashboards, LGPD compliance, AI chatbot, and security hardening. Use for creating premium landing pages, building mentoring/coaching platforms, implementing admin panels with DashboardLayout, adding LGPD/cookie consent, integrating AI chatbots, hardening web app security."
---

# Editorial Landing Platform

End-to-end workflow for building a premium editorial landing page with backend enrollment, admin dashboard, LGPD compliance, AI chatbot, and security hardening on the Manus webdev stack (React 19 + Tailwind 4 + tRPC + Drizzle).

## Workflow Overview

1. **Design system** — Define color palette (hex only), typography (Google Fonts), and visual identity
2. **Landing page** — Build hero, about, pillars/features, founder/team, CTA form, FAQ, footer
3. **Backend & DB** — Schema, tRPC routes for form submission, file uploads (S3)
4. **Security** — Rate limiting, Helmet, CORS, honeypot, input sanitization
5. **LGPD compliance** — Cookie banner, privacy/terms/cookie policy pages, consent checkbox
6. **AI chatbot** — Floating chat widget with context-aware AI responses
7. **Admin panel** — DashboardLayout with KPIs, filtered listing, detail view, CSV export
8. **Testing** — Vitest tests for all tRPC routes (auth, RBAC, CRUD)

## Phase 1: Design System

Choose a design philosophy before writing any code. Define in `client/src/index.css`:

```css
@theme inline {
  --color-navy: #1A2744;       /* Use HEX only — oklch breaks in Tailwind 4 production builds */
  --color-warm-white: #FAFAF8;
  --color-sand: #E8E0D4;
  --color-gold: #B8A88A;
  --font-display: 'Cormorant', serif;
  --font-body: 'Lora', serif;
  --font-accent: 'Montserrat', sans-serif;
}
```

**Critical:** Never use oklch() in `@theme inline` — Tailwind 4 converts them incorrectly in production builds (e.g., warm-white/30 becomes cyan instead of translucent white). Always use hex values.

Load fonts in `client/index.html` via Google Fonts CDN.

## Phase 2: Landing Page Sections

Build as separate components in `client/src/components/`:

| Section | Component | Key elements |
|---------|-----------|-------------|
| Navigation | `Navbar.tsx` | Logo, anchor links, CTA button, scroll-aware bg change |
| Hero | `HeroSection.tsx` | Background image (CDN), headline, subtitle, dual CTAs |
| About | `AboutSection.tsx` | Mission text, key descriptors |
| Features/Pillars | `PillarsSection.tsx` | Grid cards with icons, optional flip animation |
| Founder/Team | `FounderSection.tsx` | Photo, quote, bio, summary cards |
| CTA Form | `CTASection.tsx` | Name, email, phone, message, LGPD consent checkbox, honeypot field |
| FAQ | `FAQSection.tsx` | Accordion with shadcn/ui `Accordion` |
| Footer | `Footer.tsx` | Logo, nav links, legal links (privacy, terms, cookies), social |

See `references/ui-components.md` for complete snippets of Navbar (scroll-aware + mobile drawer), Footer (multi-column + legal links), Flip Cards (3D hover reveal), Cookie Banner (LGPD), and CTA Form (honeypot + consent).

For flip card animations, use CSS `perspective` + `rotateY(180deg)` with React `onMouseEnter`/`onMouseLeave` state. Use inline styles for `transition` and `transform` (Tailwind 4 `duration-600` may not compile).

**Static assets:** Upload all images/media to CDN via `manus-upload-file --webdev`. Never store in project directory.

## Phase 3: Backend & Database

See `references/backend-patterns.md` for schema, tRPC routes, and S3 file upload patterns.

Key decisions:
- Store enrollment form submissions in `mentoria_inscriptions` table with status enum (`pending`, `contacted`, `enrolled`, `rejected`)
- Use `publicProcedure` for form submission, `protectedProcedure` + admin check for management
- Store files in S3 via `storagePut()`, metadata in DB

## Phase 4: Security Hardening

See `references/security-checklist.md` for the complete security implementation checklist.

Core protections: rate limiting (express-rate-limit), Helmet.js headers, CORS, Zod validation on all inputs, honeypot anti-bot field, file upload validation (type + size + extension), request size limiting.

## Phase 5: LGPD Compliance

Three required pages + cookie banner:

1. **CookieBanner.tsx** — Floating banner with "Accept All", "Essential Only", "Details" options. Store consent in localStorage. Show on first visit only.
2. **PrivacyPolicy.tsx** — Route `/privacidade`. Cover data collection, usage, rights, retention.
3. **TermsOfUse.tsx** — Route `/termos`. Cover service terms, IP, liability.
4. **CookiePolicy.tsx** — Route `/cookies`. Cover cookie types, purposes, management.

Add LGPD consent checkbox to the enrollment form (required before submission).

## Phase 6: AI Chatbot

Floating chat widget (`PagoChatBot.tsx`) using the AI SDK with Forge API:

- Position: fixed bottom-right, expandable panel
- Context: inject system prompt with platform knowledge (mission, pillars, FAQ answers)
- Use `useChat` hook from `@ai-sdk/react` with tRPC endpoint
- Markdown rendering for responses via `Streamdown`
- Mobile-responsive (full-width on small screens)

See `references/ai-sdk.md` in the project for AI SDK patterns.

## Phase 7: Admin Panel

**Use custom AdminLayout** (not the generic DashboardLayout) for brand consistency:

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/admin` | 7 KPI cards (total, pending, enrolled, rejected, contacted, 7d, 30d), recent list |
| Listing | `/admin/inscricoes` | Search (name/email/phone), status filter, pagination, CSV export |
| Detail | `/admin/inscricoes/:id` | Full data, status change buttons, delete with confirmation |

**RBAC pattern:**
```ts
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  return next({ ctx });
});
```

Admin pages: check `user.role === "admin"` in AdminLayout, show login/forbidden screens for unauthorized users.

**Page header pattern:** Title + timestamp + divider line on every admin page for consistency.

## Phase 8: Testing

Write vitest tests for every tRPC router. Pattern:

```ts
vi.mock("./db", () => ({ /* mock all db helpers inside factory */ }));
// Import appRouter AFTER mocks
import { appRouter } from "./routers";

// Create context helpers: createAdminContext(), createUserContext(), createPublicContext()
// Test: admin access ✓, user blocked ✓, public blocked ✓, CRUD operations ✓, validation ✓
```

**Critical:** Place all mock data inside `vi.mock()` factory functions — never reference outer-scope variables (vitest hoists `vi.mock` calls above variable declarations).

## Pitfalls & Lessons Learned

- **oklch in Tailwind 4:** Colors with opacity (e.g., `text-warm-white/30`) convert incorrectly in production. Use hex only.
- **wouter Link:** Never wrap `<a>` inside `<Link>` — nested anchors cause runtime errors.
- **Flip animations:** Use inline `style` for `transition` and `transform` instead of Tailwind classes for cross-build reliability.
- **vi.mock hoisting:** Mock data referenced in `vi.mock()` factory must be defined inside the factory, not in outer scope.
- **Static assets in webdev:** Files stored locally in project directory cause deployment timeout. Always use `manus-upload-file --webdev` for CDN URLs.
- **Admin role setup:** Promote user to admin via database UI or SQL (`UPDATE user SET role = 'admin' WHERE ...`).
