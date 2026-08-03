# Kasbah3000

**A multigenerational ecological settlement** — sustainable infrastructure for rural Morocco and beyond.

## Tech Stack

- **Framework:** Astro (static + SSR hybrid)
- **Styling:** Tailwind CSS
- **Islands:** Preact (6 components)
- **Database:** Supabase
- **Hosting:** Cloudflare Pages + Workers
- **Media:** Cloudflare R2

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- Supabase credentials
- Brevo API keys
- Cloudflare Turnstile keys
- MapTiler API key
- R2 bucket URL

See `.env.example` for complete list.

## Project Structure

```
src/
├── components/     # Astro components (36 zero-JS + 6 Preact islands)
├── pages/          # Routes (FR/EN localized)
├── content/        # Markdown content collections
├── lib/            # Utilities and data access
├── i18n/           # Translation strings
├── styles/         # Global CSS
└── types/          # TypeScript types
```

## Documentation

- **PROJECT_RULES.md** — Single source of truth for all implementation decisions
- **DEVELOPMENT_PHASES.md** — 15-day timeline with detailed tasks
- **COMPONENT_HIERARCHY.md** — All 44 components specified

## Design System

Frozen design tokens from Brand Foundation v1.1:

- **Colors:** Clay, Cedar, Sun, Water, Sand palettes
- **Typography:** Cormorant Garamond (serif) + Manrope (sans)
- **Spacing:** 4px base unit
- **Motion:** Calm, architectural, barely-there

## Multilingual

- **Implemented:** French (default), English
- **Routable:** Arabic, Spanish, Amazigh (config-only, zero implementation)

## License

© 2026 Garden-Generator · Kasbah3000 · Confidential
