# Components Directory

Components organized by domain for scalability and maintainability.

## Directory Structure

### `/layout` (9 components)
Global layout components used across all pages:
- `BaseLayout.astro` — Root HTML shell
- `PageLayout.astro` — Standard page wrapper
- `Header.astro` — Site header with sticky behavior
- `Nav.astro` — Desktop navigation
- `MobileNav.astro` — Mobile drawer navigation
- `Footer.astro` — Site footer (4-column)
- `LanguageSwitcher.astro` — FR/EN toggle
- `Breadcrumbs.astro` — Navigation trail
- `SkipLink.astro` — Accessibility bypass link

### `/ui` (6 components)
Reusable UI primitives (zero-JS):
- `Button.astro` — CTA button (3 variants)
- `Card.astro` — Content container
- `Badge.astro` — Pill tags
- `Input.astro` — Form input field
- `Alert.astro` — Status messages
- `Pagination.astro` — Page navigation

### `/content` (19 components)
Content-specific display components:
- `Hero.astro` — Full-bleed homepage hero
- `HeroVideo.astro` — Background video
- `PageHero.astro` — Interior page hero
- `Prose.astro` — Markdown wrapper
- `SectionTitle.astro` — Section heading block
- `KeyFigures.astro` — Stat band
- `GoalsGrid.astro` — 5-year/20-year goals
- `Timeline.astro` — CSS-only timeline
- `PrincipleCard.astro` — System principle card
- `PillarList.astro` — Principle page display
- `TeamGrid.astro` / `TeamCard.astro` — Team members
- `PartnerGrid.astro` / `PartnerCard.astro` — Partners
- `ArticleCard.astro` — Blog article card
- `MediaFigure.astro` — Image with caption
- `FaqAccordion.astro` — FAQ list
- `ContactDetails.astro` — Contact info block
- `CtaBand.astro` — Call-to-action section

### `/sections`
Page-specific section components (Day 4+):
- Will contain: `VisionSection.astro`, `SystemsSection.astro`, etc.
- Domain-specific compositions of content components

### `/forms`
Form-specific components (Day 10):
- Will contain form field wrappers, validation displays
- Complements islands (ContactForm, NewsletterForm)

### `/islands` (6 Preact components ONLY)
Interactive components requiring JavaScript:
- `ProjectMap.tsx` — MapLibre map (`client:visible`)
- `Lightbox.tsx` — Gallery viewer (`client:visible`)
- `ContactForm.tsx` — Contact form (`client:visible`)
- `NewsletterForm.tsx` — Email capture (`client:visible`)
- `AdminTable.tsx` — Admin CRUD list (`client:load`)
- `AdminForm.tsx` — Admin CRUD form (`client:load`)

**Rule:** No additional islands without approval. Prefer Astro components.

### `/seo` (2 components)
SEO and metadata components:
- `Seo.astro` — Meta tags, OG, hreflang
- `JsonLd.astro` — Structured data

## Naming Conventions

- **Astro components:** PascalCase (e.g., `ArticleCard.astro`)
- **Preact islands:** PascalCase + `.tsx` (e.g., `ContactForm.tsx`)
- **One component per file**
- **Co-locate related components** (e.g., `TeamGrid` + `TeamCard`)

## Import Pattern

```astro
---
import { Button } from '@components/ui/Button.astro';
import { Hero } from '@components/content/Hero.astro';
import { Header } from '@components/layout/Header.astro';
---
```

## Future Scalability

This structure supports Phase 2+ features without reorganization:
- `/sections` for complex page compositions
- `/forms` for form field patterns
- Additional `/ui` primitives as needed
- Component domain clear from directory name

## Phase 2 Readiness

Structure prepared for (without implementing):
- AI Agent components (chatbot UI)
- Community features (profile cards, forum threads)
- Marketplace components (product cards, checkout)
- Training components (course cards, certificates)
- Reservation components (calendar, booking forms)
