# Kasbah3000

> A production-grade, multilingual website for **Kasbah3000** — a regenerative,
> multigenerational eco-village project in rural Morocco.

Kasbah3000 is a sustainable settlement initiative combining bioclimatic
architecture, renewable energy, agroecology and participatory governance. This
repository contains the project's public website: a fast, accessible, fully
localized marketing and engagement site with secure server-side form handling
deployed on Cloudflare's edge network.

🌍 **Production:** https://www.kasbah3000.com

---

## ✨ Key Features

- **Full 4-language internationalization** — French (default), English, Arabic
  and German, with a locale-aware routing scheme and a fallback chain
  (`ar`/`de` → `en` → `fr`).
- **Proper RTL support** — Arabic is rendered right-to-left using logical
  CSS direction, not visual hacks.
- **Secure transactional email routing** — contact, newsletter (double opt-in)
  and webinar-registration flows delivered through the Brevo API, with
  acknowledgement emails localized across all four languages.
- **Defense-in-depth form security** — Cloudflare Turnstile verification
  (action + hostname bound), KV-backed fixed-window rate limiting that *fails
  closed*, honeypot fields, strict JSON body-size limits and HTML escaping on
  all user-supplied content.
- **Hardened HTTP security headers** — a strict Content-Security-Policy, HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
  `Permissions-Policy`, mirrored across both static (`_headers`) and SSR
  (middleware) responses.
- **Interactive map** — a MapLibre GL island showing the project territory,
  with a keyless OpenStreetMap fallback when no MapTiler key is configured.
- **Content-driven** — principles, legal pages, team, partners, articles and
  FAQs are authored as Markdown collections and localized seed data.
- **SEO-ready** — per-locale sitemap, canonical/alternate links, JSON-LD
  structured data and `robots.txt`.
- **Accessible by default** — skip links, semantic landmarks and
  keyboard-navigable components.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Astro](https://astro.build) (SSR hybrid, `output: 'server'`) |
| **Interactive islands** | [Preact](https://preactjs.com) (contact / newsletter / webinar forms, MapLibre map, lightbox) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) (v4, Vite plugin) |
| **Mapping** | [MapLibre GL JS](https://maplibre.org) |
| **Runtime / Hosting** | [Cloudflare Workers](https://workers.cloudflare.com) via `@astrojs/cloudflare` |
| **Rate limiting** | Cloudflare KV (`RATE_LIMIT_KV`) |
| **Bot protection** | Cloudflare Turnstile |
| **Transactional email** | [Brevo](https://www.brevo.com) API |
| **Validation** | [Zod](https://zod.dev) |
| **Language** | TypeScript |

### How it fits together

```
Browser
  │
  ▼
Cloudflare Worker (Astro SSR + static assets)
  ├─ Static pages .......... prerendered HTML, security headers via public/_headers
  ├─ Preact islands ........ hydrated only where interactivity is needed
  └─ API routes (/api/*) ... server-only, prerender = false
        │
        ├─ Turnstile verification ....... challenges.cloudflare.com
        ├─ Rate limiting ................ Cloudflare KV (fail-closed)
        └─ Email delivery ............... Brevo API (contact / newsletter DOI / webinar)
```

- **Routing & i18n** — the default locale (`fr`) is served at the root; `en`,
  `ar` and `de` are served under `/[lang]/…`. Translation strings live in
  `src/i18n/{fr,en,ar,de}.json`; localized content lives in
  `src/content/**` as `*.{lang}.md` and localized JSON seed data.
- **Islands** — only forms, the map and the lightbox ship JavaScript; the rest
  of the site is zero-JS Astro output.
- **Server environment** — secrets and bindings are resolved from the Worker
  runtime (`cloudflare:workers`), with an `import.meta.env` fallback for local
  `astro dev`. Form endpoints return `503` rather than a false success when
  required configuration is absent.

---

## 📁 Project Structure

```
src/
├── components/     # Astro components (zero-JS) + Preact islands
│   ├── content/    # Content building blocks (cards, hero, grids…)
│   ├── islands/    # Interactive Preact components (forms, map, lightbox)
│   ├── layout/     # Header, footer, navigation, layouts
│   ├── pages/      # Full page shells
│   ├── seo/        # SEO + JSON-LD
│   └── ui/         # Primitive UI (button, input, badge…)
├── content/        # Markdown collections + localized seed data
├── i18n/           # Translation tables (fr / en / ar / de)
├── lib/
│   ├── api/        # Form request parsing + environment resolution
│   ├── email/      # Brevo integration
│   ├── forms/      # Zod schemas, Turnstile client, copy
│   ├── security/   # Server-side Turnstile verification
│   └── utils/      # i18n, rate limiting, media, pagination…
├── pages/          # File-based routes (root locale + /[lang]/…) + /api
├── middleware.ts   # Security headers for SSR responses
├── styles/         # Global + typography CSS
└── types/          # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 22.12.0**
- npm

### Installation

```bash
git clone <this-repo-url>
cd kasbah3000
npm install
```

### Environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Canonical site origin |
| `BREVO_API_KEY` | Brevo transactional email (server-only) |
| `BREVO_SENDER_EMAIL` | Verified sender address |
| `CONTACT_RECIPIENT_EMAIL` | Internal inbox for form notifications |
| `BREVO_NEWSLETTER_LIST_ID` | Brevo list for double opt-in |
| `BREVO_DOI_TEMPLATE_ID` | Brevo double-opt-in email template |
| `BREVO_DOI_REDIRECT_URL` | Post-confirmation redirect (HTTPS) |
| `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |
| `PUBLIC_MAPTILER_KEY` | MapTiler basemap (optional; OSM fallback otherwise) |

> **Security note:** real secrets are never committed. In production they are
> configured as Cloudflare secrets/bindings; `.env` is git-ignored.

### Commands

```bash
npm run dev      # Start the local dev server
npm run check    # Type-check + Astro diagnostics
npm run lint     # ESLint (zero-warning policy)
npm run build    # Production build (Cloudflare Worker + static assets)
npm run preview  # Preview the production build locally
```

---

## ☁️ Deployment

The site is deployed to **Cloudflare Workers** using the `@astrojs/cloudflare`
adapter. Configuration lives in `wrangler.jsonc` (KV namespace binding,
assets, observability). Production secrets are injected via the Cloudflare
dashboard / `wrangler secret`, never stored in the repository.

---

## 🔒 Security Highlights

- No secrets in source control (`.env` is ignored; only `.env.example` ships).
- Strict, mirrored CSP across static and SSR responses.
- Turnstile verification bound to both the expected action and hostname
  (apex + `www`).
- Fail-closed KV rate limiting on every public form endpoint.
- User input is HTML-escaped before being placed into emails to prevent
  injection and spam-relay abuse.

---

## 📄 License

© 2026 Kasbah3000. All rights reserved.
