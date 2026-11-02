# Redesign Master Brief: [Project Name]

**Status:** Draft v1 | **Owner:** [Name] | **Last updated:** [Date]

This is the single source of truth for the redesign. Read it fully before changing anything. If something here conflicts with a request in chat, ask before proceeding. If something is missing, add it to "Open questions" (section 24) rather than guessing.

Reference for structure and feel: https://www.jetronticket.com/. We borrow its pacing, product-first storytelling and audience split (attendees vs organizers). We do **not** borrow its brand, logo, copy, images, artist or event content. Everything user-facing must be original.

---

## Table of contents
1. Vision and success metrics
2. Audience and jobs to be done
3. Brand and voice
4. Information architecture and sitemap
5. Design principles
6. Design system (tokens)
7. Layout, grid and responsive rules
8. Component library
9. Page specs
10. Content and copy rules
11. Motion and interaction
12. Imagery, video and iconography
13. Accessibility
14. Performance budget
15. SEO, metadata and social sharing
16. Analytics, tracking and experimentation
17. Forms, validation and error handling
18. Auth, accounts and permissions
19. Payments, wallet and trust
20. Internationalization and localization
21. Legal, privacy and compliance
22. Tech stack, architecture and conventions
23. Extensibility: things we may add later
24. Open questions
25. Phases, order of work and definition of done
26. QA checklist
27. Rules for AI coding agents

---

## 1. Vision and success metrics

**Vision:** [One sentence. Example: "The most trusted place to find a night out and to sell out your own event."]

**The site must feel:** confident, premium, fast, and alive. A first-time visitor should understand what we do and what to click within five seconds.

**Primary goals**
- Attendees: reach an event page and start checkout with the fewest possible steps.
- Organizers: understand the value and start creating an event.
- Brand: look like an established, well-funded company, not a template.

**Metrics to improve (set real targets)**
| Metric | Today | Target |
|---|---|---|
| Landing to Explore click-through | [ ] | [ ] |
| Event page to checkout start | [ ] | [ ] |
| Checkout completion rate | [ ] | [ ] |
| Organizer sign-up starts | [ ] | [ ] |
| Mobile bounce rate | [ ] | [ ] |
| Largest Contentful Paint (mobile) | [ ] | under 2.5s |
| Lighthouse (performance / a11y / SEO / best practices) | [ ] | 90 / 95 / 100 / 95 |

## 2. Audience and jobs to be done

| Audience | Main job | Key worry | What the site must prove |
|---|---|---|---|
| Attendee (primary, mobile-heavy) | "Find something worth going to and buy fast" | Fake tickets, hidden fees, sold out | Real events, clear total price, instant ticket delivery |
| Organizer | "Sell tickets and get paid reliably" | Fees, payout delays, fraud, bots | Transparent pricing, payout schedule, anti-fraud, dashboard |
| Brand/sponsor/partner | "Reach an audience" | Reach, credibility | Audience numbers, past events, contact path |
| Developer/integrator | "Embed ticketing on my own site" | Docs, reliability | Clear docs, API status, examples |
| Venue/promoter team (staff) | "Run entry on the night" | Queues, scanning failures | Scanner app, guest list, live attendance |

Define 3 personas with a name, device, connection quality and one quote each: [add].

## 3. Brand and voice

- **Brand personality:** [3 adjectives, e.g. bold, warm, trustworthy]
- **Positioning line:** [one sentence]
- **Logo usage:** clear space = height of the logo mark on all sides; minimum size 24px tall on screen; provide light and dark versions; never stretch, recolor outside the palette, or add effects.
- **Voice:** plain, specific, human. Active voice. Sentence case. No filler, no hype words ("revolutionary", "seamless", "world-class").
- **Tone by context:**
  - Marketing: confident and energetic
  - Checkout and money: calm, exact, no jokes
  - Errors: say what happened and how to fix it; never blame the user; never apologize repeatedly
  - Empty states: an invitation to act
- **Naming rules:** one name per concept everywhere (for example, always "Ticket", never "Pass" in one place and "Entry" in another). Keep a glossary: [add].

## 4. Information architecture and sitemap

```
/                          Home
/explore                   Explore (filters, search, map toggle)
  /explore?category=...    Category views
/event/[slug]              Event detail
  /event/[slug]/checkout   Checkout
/location/[city]           City landing pages
/artist/[slug]             Artist/performer page
/venue/[slug]              Venue page
/organizer/[slug]          Public organizer profile
/collections/[slug]        Curated lists (This weekend, Free events, Under 10k)
/features                  Organizer features
/pricing                   Pricing and fee calculator
/developers                Developer hub (docs, API, embed widget)
/blog, /blog/[slug]        Editorial
/about                     Company story, team
/careers                   Open roles
/press                     Press kit, media contact
/partners                  Sponsors/partners
/gift-cards                (future)
/help                      Help center, search, articles
/contact                   Contact options
/faq                       FAQ
/status                    System status
/account                   Attendee: tickets, orders, wallet, saved, settings
/dashboard                 Organizer: events, sales, payouts, team, settings
/legal/terms, /legal/privacy, /legal/cookies, /legal/refunds, /legal/prohibited-items
/404, /500, /maintenance
```

**Navigation rules**
- Header: logo, Explore, Features, Pricing, Developers, Blog, Sign in, primary button "Create event".
- Header becomes solid on scroll; transparent over hero; collapses to a full-screen menu on mobile with the primary CTA pinned at the bottom.
- Footer: Product, Company, Resources, Legal, Locations, social icons, app badges, language/currency selector, newsletter signup.
- Breadcrumbs on all pages deeper than two levels.
- Maximum two levels in the main nav. Anything deeper lives in the footer or in search.

## 5. Design principles

1. **One memorable thing per page.** Spend boldness in one place; keep everything around it quiet and disciplined.
2. **Product first.** Show real UI and real events. No generic stock imagery, no abstract blobs as filler.
3. **Clarity over cleverness.** Labels describe what happens ("Buy 2 tickets", not "Continue").
4. **Mobile is the primary canvas.** Design at 360px first.
5. **Total price honesty.** Always show the final price, fees included, before checkout.
6. **Structure carries meaning.** Borders, dividers, numbering and labels only appear when they encode information. Numbered steps only for real sequences.
7. **Fast feels premium.** Performance is a design feature.
8. **Consistency by tokens.** No one-off colors, radii, shadows or spacing values.

**Avoid (common template tells):**
- Cream background plus serif plus terracotta accent combo, or near-black plus single neon accent, used by default rather than by choice
- Identical rounded cards with the same soft shadow everywhere
- An all-caps tracked eyebrow label above every heading
- Highlighting a single word in every headline with a different color or italic
- Arrows appended to every link ("Learn more →")
- Fade-and-slide-up on every section and hover lift on every card
- Gradient washes as decoration
- Meta strings joined with middle dots as a design device

## 6. Design system (tokens)

> The reference's exact CSS values were not available, so everything below is a starting point. Replace bracketed values with brand decisions. Never hard-code values in components; always use tokens.

### 6.1 Color
```css
:root {
  /* Neutrals (dark-first) */
  --bg:           #111111;
  --bg-elevated:  #181818;
  --surface:      #1F1F1F;
  --surface-2:    #2A2A2A;
  --border:       #333333;
  --border-strong:#4A4A4A;

  --text:         #F5F5F5;
  --text-muted:   #A8A8A8;
  --text-subtle:  #7A7A7A;   /* decorative only; fails AA for body text */
  --text-inverse: #111111;

  /* Brand */
  --brand:        #[BRAND];
  --brand-hover:  #[BRAND-DARKER];
  --brand-press:  #[BRAND-DARKEST];
  --brand-subtle: #[BRAND-10%-ON-BG];
  --on-brand:     #[HIGH-CONTRAST-TEXT-ON-BRAND];

  /* Feedback */
  --success:      #3DDC84;
  --warning:      #FFB020;
  --danger:       #FF5C5C;
  --info:         #5AA9FF;

  /* Overlays */
  --scrim:        rgba(0,0,0,.6);
  --hero-gradient:linear-gradient(to top, rgba(17,17,17,.95), rgba(17,17,17,0) 60%);
}

[data-theme="light"] {
  --bg:#FFFFFF; --bg-elevated:#F7F7F7; --surface:#F0F0F0; --surface-2:#E6E6E6;
  --border:#DDDDDD; --border-strong:#BBBBBB;
  --text:#111111; --text-muted:#555555; --text-subtle:#8A8A8A; --text-inverse:#FFFFFF;
}
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { /* mirror light tokens */ } }
```
Rules: every text/background pair must meet WCAG AA (4.5:1 body, 3:1 large text and UI components). Color is never the only carrier of meaning (add icon or text).

### 6.2 Typography
- Families: one or two. If two, make them clearly distinct (for example a distinctive display face plus a neutral text face). [Display: ___ | Text: ___ | Mono (only if data tables need it): ___]
- Choose fonts deliberately for this brand, not the default you would pick for any project. Self-host with `font-display: swap`, subset to the languages we need, preload only the critical weights, and define metric-matched fallbacks to prevent layout shift.
- Scale (fluid):
```css
--text-xs: .75rem;   --text-sm: .875rem;  --text-base: 1rem;
--text-lg: 1.125rem; --text-xl: 1.25rem;  --text-2xl: clamp(1.5rem, 2.5vw, 1.875rem);
--text-3xl: clamp(1.875rem, 3.5vw, 2.5rem);
--text-4xl: clamp(2.25rem, 5vw, 3.5rem);
--text-hero: clamp(2.75rem, 7vw, 5rem);
--leading-tight: 1.1; --leading-snug: 1.3; --leading-body: 1.6;
--tracking-tight: -0.02em; --tracking-normal: 0;
```
- Body line length max 70 characters. Headings use tight leading; body uses 1.6.
- Numbers in tables and prices use tabular figures (`font-variant-numeric: tabular-nums`).
- Currency formatting always via `Intl.NumberFormat`, never string concatenation.

### 6.3 Spacing, radius, elevation, z-index
```css
--space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
--space-6:32px; --space-7:48px; --space-8:64px; --space-9:96px; --space-10:128px;
--section-y: clamp(64px, 9vw, 128px);

--radius-sm:6px; --radius-md:12px; --radius-lg:20px; --radius-pill:999px;
/* Use different radii by hierarchy: small controls sm, cards md, hero media lg, buttons pill. */

--shadow-1: 0 1px 2px rgba(0,0,0,.2);
--shadow-2: 0 8px 24px rgba(0,0,0,.25);
--shadow-3: 0 24px 64px rgba(0,0,0,.35);

--z-base:0; --z-sticky:100; --z-dropdown:200; --z-overlay:300; --z-modal:400; --z-toast:500;
```

### 6.4 Breakpoints
`xs 360 | sm 480 | md 768 | lg 1024 | xl 1280 | 2xl 1536`. Container max-width 1200px (1400px for media-heavy sections). Gutters 16px mobile, 24px tablet, 32px desktop.

### 6.5 Iconography
One icon set (stroke 1.5px, 24px grid, rounded joins). Icons inherit `currentColor`. Decorative icons get `aria-hidden`; meaningful icons get labels.

## 7. Layout, grid and responsive rules

- 4-column grid on mobile, 8 on tablet, 12 on desktop.
- Align text left by default; center only short hero or section intros.
- Sections separated by whitespace first, background shifts second, dividers last.
- Never rely on hover for essential actions (touch devices).
- Tap targets minimum 44x44px.
- Sticky mobile bottom bar on event pages: price from, "Get tickets" button.
- Support safe areas (`env(safe-area-inset-*)`) for notched phones.
- Test orientations, 200% browser zoom, and text-size increases without breaking layout.

## 8. Component library

Build each component with: variants, sizes, all states (default, hover, focus-visible, active, disabled, loading, error), dark and light themes, keyboard behavior, ARIA, and a documented example (Storybook or equivalent).

**Foundations:** Button (primary, secondary, ghost, danger, icon-only, loading), Link, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider, DatePicker, DateRangePicker, TimePicker, PhoneInput (with country codes), OTPInput, FileUpload, Stepper (quantity), Tabs, Accordion, Tooltip, Popover, Dropdown menu, Modal, Drawer/Bottom sheet, Toast, Banner/Alert, Badge, Tag/Chip, Avatar, Skeleton, Spinner, Progress, Pagination, Breadcrumb, Divider, Table, EmptyState, ErrorState.

**Marketing:** Header, Footer, Hero (image, video, and split variants), LogoMarquee, FeatureBlock (alternating), PhoneFrame, StatBand, TestimonialCard/Carousel, CaseStudyCard, PricingTable, FeeCalculator, ComparisonTable, FAQ, CTA band, NewsletterSignup, AppBadges, LocationCard, TeamCard, TimelineBlock, BlogCard, ArticleLayout (with table of contents), PressLogoRow, AwardBadges.

**Commerce:** EventCard (portrait and landscape), EventCarousel, EventFilters (category, date, price, location, sort), SearchBar with suggestions, MapView with clustered pins, CategoryTile, TicketTierSelector, SeatMap (zoom, pan, availability states, accessible seats), CartSummary, CheckoutForm, PromoCodeField, OrderConfirmation, TicketCard (QR, wallet add), CountdownTimer (hold timer), SoldOut/Waitlist, QueueScreen, ShareSheet, SaveEventButton, AddToCalendar, VenueInfo, ArtistCard with audio preview, LineupList.

**Dashboard:** Sidebar, TopBar, StatCard (with trend), Chart (line, bar, donut; always with accessible table alternative), DataTable (sort, filter, pagination, column toggle, export), EventWizard (multi-step with autosave), TicketTierEditor, PayoutCard, TeamInvite, RoleBadge, ScannerStatus, GuestList, RefundDialog, ReportBuilder, NotificationCenter.

## 9. Page specs

For each page define: purpose, primary CTA, content order, states (loading, empty, error, offline, sold out, past event), and SEO.

### 9.1 Home (follow the reference's pacing)
1. Header
2. **Hero:** full-bleed real photography or short muted video loop, one headline, one supporting sentence, two CTAs ("Discover events", "Create event"). Gradient overlay guarantees text contrast. A poster image loads first; video loads only on fast connections and never on data-saver mode.
3. **Live discovery strip:** real upcoming events, portrait posters, horizontally scrollable with keyboard support.
4. **Trust:** logo marquee of promoters/partners (grayscale, reduced-motion safe) plus 2 to 3 hard numbers (tickets sold, events hosted, cities) only if true and verifiable.
5. **Attendee value blocks** (phone mockups): Discover, Map, Artist previews, Wallet.
6. **Organizer value blocks:** Create an event in minutes, Seat maps, Smart queues, Anti-bot verification, Embeddable widget.
7. **Dashboard showcase:** realistic product UI with believable data.
8. **Testimonials/case studies:** named people, photo, event, result.
9. **Locations**
10. **Press/awards** (if any)
11. **App download band**
12. **FAQ** (5 to 7 questions)
13. **Final CTA band**
14. **Footer**

### 9.2 Explore
- Sticky filter bar; list/grid and map toggle; infinite scroll with "back to my position" support; URL reflects every filter so results are shareable.
- Sections (as anchors): Trending, Sponsored (clearly labeled), Near you, Featured, Affordable, Categories.
- Empty results: suggest broadening filters and show popular events.

### 9.3 Event detail
- Hero media, title, date/time (with time zone), venue (map link), organizer, price from.
- Ticket tiers with live availability ("12 left" only when true), quantity steppers, total with fees broken down.
- About, lineup/schedule, venue info, FAQs (age limit, bag policy, refunds), related events, share and save.
- States: on sale, not yet on sale (notify me), sold out (waitlist), ended (show similar events), cancelled (clear refund info).
- Structured data (`Event`, `Offer`) for rich search results.

### 9.4 Checkout
- Maximum 3 steps: Tickets, Details, Pay. Guest checkout allowed.
- Progress indicator, order summary always visible, hold timer with clear warning and extension rule.
- Payment methods relevant to market: [cards, bank transfer, USSD, mobile money, wallet, Apple/Google Pay]. 
- Clear error recovery for failed or pending payments. Never double-charge: idempotent submissions and a pending-state screen.
- Confirmation page plus email/SMS/WhatsApp delivery; add-to-wallet and add-to-calendar.

### 9.5 Account (attendee)
Tickets (upcoming, past, transferable), Orders and receipts, Wallet/refunds, Saved events, Following (artists, organizers, venues), Notifications, Profile, Security, Delete account.

### 9.6 Organizer dashboard
Overview (revenue, tickets sold, payout pending, trends), Events list, Event wizard, Ticket management, Attendees/orders, Check-in/scanner, Promo codes, Affiliates/referral tracking, Payouts and bank accounts, Reports/exports, Team and roles, Branding, Embed/API keys, Webhooks, Settings.

### 9.7 Features, Pricing, Developers
- **Features:** grouped by job (Sell, Promote, Manage, Get paid, Secure). Each with product UI, one outcome sentence and a link to docs.
- **Pricing:** transparent fee table, fee calculator (enter ticket price and expected sales), what is included, FAQ, enterprise contact.
- **Developers:** quickstart, API reference, embed widget configurator with live preview, SDKs, changelog, status link.

### 9.8 Content pages
Blog (categories, search, author pages, related posts, newsletter), About, Careers, Press, Partners, Help center (searchable, categorized, article feedback), Contact (email, WhatsApp, chat, form with category routing), Legal pages with last-updated dates and version history, City landing pages with local events and local SEO copy.

### 9.9 System pages
404 (search plus popular links), 500, maintenance, offline, expired link, rate-limited, permission denied. Each has a clear next action.

## 10. Content and copy rules

- Write for the end user in simple language; describe what a thing does, not how it is built.
- CTAs say exactly what happens: "Get tickets", "Publish event", "Save changes". Keep names consistent across the flow (button says "Publish", toast says "Published").
- Headings are 3 to 8 words. One idea per section.
- No lorem ipsum in anything shipped. Placeholder content must be realistic and clearly flagged in a `CONTENT_TODO.md`.
- Prices always include currency and are formatted per locale.
- Dates always show time zone for events; relative dates ("Tomorrow") are allowed when the absolute date is also visible.
- Reading level: aim for grade 8 or below on marketing pages.
- Microcopy inventory (all in one file for translation): buttons, labels, placeholders, errors, empty states, toasts, emails, SMS, push notifications.

## 11. Motion and interaction

- Purpose: to draw attention once, or to show what changed after a user action. Not decoration.
- Budget: one orchestrated hero moment on first load, the logo marquee, and responsive feedback (open, close, expand, confirm, drag).
- Durations: micro 120 to 180ms, UI 200 to 300ms, page-level 400 to 600ms. Easing: ease-out for entering, ease-in for leaving.
- Respect `prefers-reduced-motion`: replace movement with fades or nothing; stop autoplay video and marquee.
- Page transitions: optional, must never delay interaction or break back-button behavior.
- Loading: skeletons that match the final layout; never a bare spinner for content areas.
- Scroll: no scroll-jacking. Sticky elements must not cover focused content.
- Haptics and sounds (mobile web/app): off by default.

## 12. Imagery, video and iconography

- Photography: real events, real people, natural light, diverse crowds; consistent color treatment. Get written usage rights for every image and store the license record.
- Event posters: shown uncropped in portrait cards (aspect 4:5 or 2:3); landscape crops handled with art direction, not blind cover-fit.
- Formats: AVIF/WebP with JPEG fallback; responsive `srcset`/`sizes`; explicit width and height to prevent layout shift; `loading="lazy"` below the fold; hero image `fetchpriority="high"`.
- Video: H.264 + WebM, muted loop under 3MB for hero, captions for anything with speech, poster frame always present.
- Phone mockups: consistent device frame, real product screenshots (never faked UI), updated whenever the product changes.
- Illustrations (if any): one style, one palette from tokens. Avoid generic abstract filler.
- Alt text: describe purpose, not appearance ("Poster for Friday night rooftop party", not "image").
- Favicons, app icons, OG images (1200x630 with variants per page type), and Apple touch icons all produced from the master logo.

## 13. Accessibility (WCAG 2.2 AA minimum)

- Semantic HTML first; ARIA only to fill gaps.
- Full keyboard operability; visible `:focus-visible` ring (2px, 3:1 contrast against both adjacent colors); logical tab order; skip-to-content link.
- Focus management in modals, drawers, route changes and toasts (announce via `aria-live`).
- Seat map: keyboard navigable, screen-reader labels per seat (section, row, number, price, status), and a non-visual alternative ("choose best available").
- Charts: text summary plus data table alternative.
- Forms: visible labels, programmatic error association, error summary on submit, no placeholder-only labels, autocomplete attributes.
- Time-limited actions (checkout hold): warn, allow extension.
- Targets 44px; no drag-only interactions; pinch/zoom never disabled.
- Test with VoiceOver (iOS), TalkBack (Android), NVDA or JAWS, and keyboard only. Automated checks (axe) in CI are required but not sufficient.
- Publish an accessibility statement and a contact path for issues.

## 14. Performance budget

| Item | Budget |
|---|---|
| LCP (mobile, 4G) | under 2.5s |
| INP | under 200ms |
| CLS | under 0.1 |
| JS per route (compressed) | under 170KB initial |
| Total page weight (home) | under 1.5MB before interaction |
| Hero media | image under 200KB; video under 3MB, lazy on slow connections |
| Fonts | max 2 families, 4 files |

- Design for low-end Android devices and unstable networks first: optimistic UI, retry with backoff, offline-friendly ticket viewing (tickets must open without signal).
- Code-split by route; lazy-load maps, charts, seat maps and video; use server rendering or static generation for marketing and event pages; cache with a CDN; image CDN with on-the-fly resizing.
- Third-party scripts loaded after interaction or via a consent-gated manager; every third-party script requires an owner and a reason.
- Monitor real-user metrics (RUM) and set alerts on regressions.
- High-demand sales: virtual queue, rate limits, bot protection, and graceful "you're in line" screens (design these, do not leave them to infrastructure defaults).

## 15. SEO, metadata and social sharing

- Unique `title` (under 60 chars) and `meta description` (under 155) per page, templated for events, cities, artists, venues and blog posts.
- Canonical URLs, clean slugs, `hreflang` for each locale, XML sitemaps (split by type), `robots.txt`, noindex for checkout/account/dashboard/search-result permutations.
- Structured data: `Event`, `Offer`, `Organization`, `WebSite` (with sitelinks search), `BreadcrumbList`, `FAQPage`, `Article`, `LocalBusiness` where valid, `VideoObject`.
- Open Graph and Twitter cards per page; dynamic OG images for events (poster, date, venue, price from).
- City and category landing pages with unique, useful copy (not duplicated templates).
- Redirect map from old URLs to new ones (301), tested before launch. No broken inbound links.
- Past events remain indexable with clear "ended" state and links to similar upcoming events.
- Core Web Vitals tracked in Search Console.

## 16. Analytics, tracking and experimentation

- Define an event taxonomy before building (name, properties, owner). Examples: `view_event`, `select_tier`, `begin_checkout`, `payment_failed`, `purchase`, `create_event_start`, `create_event_publish`, `search`, `filter_apply`, `share`, `save_event`.
- Funnels: Home to Event to Checkout to Purchase; Landing to Organizer sign-up to First event published.
- Consent first: no non-essential tracking before consent where required; respect Do Not Track and Global Privacy Control.
- Server-side purchase events for accuracy; deduplicate with client events.
- Experimentation framework (feature flags plus A/B tests) with guardrail metrics (errors, load time, refund rate). Never test on checkout without a rollback plan.
- Error monitoring (frontend and backend) with release tagging and source maps.
- Session replay only with masking of all inputs and payment fields, and only with consent.
- Dashboards: acquisition, conversion, performance, errors, and support volume.

## 17. Forms, validation and error handling

- Inline validation on blur, summary on submit; never clear a form on error; keep entered data.
- Smart defaults: detect country/currency, use correct input types and `inputmode`, support autofill and password managers, paste allowed everywhere.
- Phone numbers: international format with country selector; email typo hints.
- Error pattern: what happened, why (if known), what to do next. Example: "Card declined. Try another card or pay by bank transfer."
- Network failures: preserve state, show retry, never lose a paid order. Payments use idempotency keys and a status page the user can return to.
- Anti-abuse: invisible bot checks first, challenges only when needed; avoid CAPTCHAs that block accessibility.
- Success states confirm what changed and the next step.

## 18. Auth, accounts and permissions

- Sign in options: email + one-time code, phone + OTP, social sign-in ([Google, Apple]), passkeys (future). Password optional.
- Guest checkout with account creation offered after purchase.
- Roles for organizer teams: Owner, Admin, Finance, Marketing, Door staff, Viewer. Permission matrix documented: [add].
- Sessions: secure cookies, sensible expiry, device list with sign-out-everywhere.
- Account recovery, email change verification, 2FA for organizers (required for payout changes).
- Identity verification (KYC) flow for organizers before first payout: clear steps, progress, status, and rejection reasons.
- Account deletion and data export self-serve.

## 19. Payments, wallet and trust

- Show total price early; fees itemized; no surprise charges at the last step.
- Trust signals near payment: accepted methods, secure payment note, refund policy summary, support contact. No fake badges or unverifiable claims.
- Refunds and cancellations: clear policy per event, self-serve request where possible, status tracking.
- Ticket authenticity: dynamic QR, anti-screenshot rotation (optional), transfer rules, verified-resale only.
- Organizer payouts: schedule shown on dashboard, statuses (pending, processing, settled, failed), downloadable statements.
- Fraud and chargeback handling visible to organizers (case status, evidence upload).
- Promo codes, referral and affiliate attribution, group discounts, early-bird tiers with auto-switch dates.
- Taxes/VAT display rules per market: [add].

## 20. Internationalization and localization

- Launch markets: [e.g. Nigeria, Ghana]. Future: [add].
- All strings externalized; no concatenated sentences; support plurals and gender where needed.
- Locales: [en-NG, en-GH]; future [fr, pt, yo, ha, ig, sw].
- Currency per market with `Intl.NumberFormat`; show local currency by default; multi-currency checkout is a future flag.
- Dates, times and time zones via `Intl.DateTimeFormat`; always display the event's local time.
- RTL-ready layout using logical CSS properties (`margin-inline-start`, etc.) so Arabic/Hebrew can be added later.
- Allow 30 to 40% text expansion in all layouts.
- Local payment methods, phone formats, address formats and holidays per market.

## 21. Legal, privacy and compliance

- Cookie consent with granular categories; consent log.
- Privacy policy, terms, refund policy, prohibited items, accessibility statement, all versioned with last-updated dates.
- Data protection compliance for each market (NDPR/NDPA in Nigeria, Ghana DPA, GDPR where EU users exist). Data retention schedule and DPO/contact.
- PCI: never handle raw card data in our frontend; use hosted fields or provider checkout.
- Age restrictions and content warnings supported on event pages.
- Image and music preview licensing documented.
- Sponsored content clearly labeled as such.
- Security basics: HTTPS everywhere, HSTS, CSP, secure headers, dependency scanning, rate limiting, audit logs for dashboard actions, regular pen tests.

## 22. Tech stack, architecture and conventions

- **Stack:** [Framework, e.g. Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui or Radix] | **CMS:** [Sanity/Contentful/Payload/Strapi] | **Hosting/CDN:** [Vercel/Cloudflare] | **Images:** [provider] | **Search:** [Algolia/Meilisearch/Typesense] | **Maps:** [Mapbox/Google] | **Analytics:** [PostHog/GA4/Plausible] | **Errors:** [Sentry] | **Email/SMS/WhatsApp:** [providers] | **Payments:** [providers]
- **Architecture rules**
  - Tokens defined once (CSS variables plus Tailwind config) and consumed everywhere.
  - Components are presentational and accessible by default; data fetching lives in route/server layers.
  - Strict TypeScript; no `any` without a comment explaining why.
  - Content comes from CMS or typed content files, never hard-coded in components.
  - Feature flags for anything unfinished or experimental.
  - Environment config validated at startup; no secrets in the client bundle.
  - API contracts typed and shared; errors normalized to a single shape.
- **Folder structure (suggested)**
```
/app                routes
/components/ui      primitives
/components/blocks  marketing sections
/components/commerce
/components/dashboard
/lib                utils, formatters, api clients
/styles             tokens.css, globals.css
/content            copy, legal, glossary
/messages           i18n strings
/public             static assets
/docs               this brief, ADRs, runbooks
```
- **Conventions:** ESLint + Prettier, conventional commits, small PRs, preview deploy per PR, visual regression tests, unit tests for utilities and pricing logic, end-to-end tests for checkout and organizer event creation, accessibility tests in CI.
- **Documentation:** component docs (Storybook), architecture decision records, runbook for incidents, on-call and rollback procedure.

## 23. Extensibility: things we may add later

Design the system so each of these can be added without redesigning core layouts. Reserve navigation slots, data fields and component variants now; build only when scheduled.

**Attendee features**
- Seat maps and best-available selection
- Ticket resale/transfer marketplace with price caps
- Waitlist and "notify me" for sold-out events
- Group buying and split payment
- Gift tickets and gift cards
- Add-ons: parking, merch, VIP upgrades, food and drink pre-order
- Loyalty/points, referral rewards, and memberships/season passes
- Social: follow friends, see who is going, share plans
- Personalized recommendations and "For you" feed
- Artist audio previews and playlists
- Apple/Google Wallet passes, push notifications, WhatsApp ticket delivery
- Ratings and reviews after events
- Accessibility services booking (companion seats, wheelchair spaces)

**Organizer features**
- Multi-day events, recurring events, multi-venue festivals
- Reserved seating editor, table/booth sales
- Door scanning app with offline mode and guest lists
- Dynamic pricing and tier auto-advance
- Affiliate/promoter links with commission tracking
- Email/SMS/WhatsApp campaigns, audience segments, retargeting pixels
- Custom event page themes and white-label checkout
- Embeddable widget and public API with webhooks
- Sponsor and vendor management
- Advanced reports, cohort analysis, data warehouse export
- Instant/early payouts, multi-currency settlement
- Staff scheduling and credentialing, volunteer management
- Livestream and hybrid event support, virtual lobby

**Platform and business**
- Sponsored placements with a transparent ad system and reporting
- Marketplace for vendors/venues
- Native iOS and Android apps sharing the design system
- Admin console: moderation, fraud review, support tooling, content management
- Enterprise plans: SSO, audit logs, custom contracts
- Partnership integrations (CRM, accounting, ticket aggregators, Zapier)
- AI features: event description helper, smart search, support assistant, demand forecasting (with human review and clear labeling)
- Public status page and uptime SLAs
- Community hub and organizer academy/learning center
- Additional markets, languages and currencies

**Rule for adding anything later:** write a one-page spec (problem, users, success metric, design, edge cases, analytics, rollout/flag plan), then update this brief.

## 24. Open questions

- [ ] Brand color, typefaces, and logo files
- [ ] Final list of markets, languages, currencies at launch
- [ ] Real photography/video available? Who owns usage rights?
- [ ] CMS choice and who edits content
- [ ] Payment providers and payout schedule
- [ ] Which Section 23 items are in the first 12 months?
- [ ] Current analytics baseline numbers
- [ ] Legal review owner for policies and claims ("#1 platform", numbers)
- [ ] Support channels and hours
- [ ] Budget and timeline constraints

## 25. Phases, order of work and definition of done

**Phase 0: Foundation (week 1 to 2)**
Audit current site, define metrics, finalize brand tokens, content inventory, redirect map, tech decisions.

**Phase 1: Design system (week 2 to 4)**
Tokens, base components, accessibility patterns, Storybook, light/dark themes.

**Phase 2: Marketing core (week 4 to 7)**
Header, footer, Home, Features, Pricing, About, Contact, legal pages, SEO setup.

**Phase 3: Discovery and commerce (week 6 to 10)**
Explore, event detail, city pages, checkout, confirmation, account tickets.

**Phase 4: Organizer experience (week 9 to 13)**
Dashboard, event wizard, payouts, attendees, scanner.

**Phase 5: Content and growth (week 12 to 15)**
Blog, help center, developers, press, partners, analytics, experiments.

**Phase 6: Hardening and launch (week 14 to 16)**
Performance, accessibility audit, security review, load tests, redirects, soft launch, monitoring, rollback plan.

Timelines are placeholders; adjust to the team.

**Work rules:** one phase at a time; small reviewable commits; after each step, summarize what changed, what is untested, and what is next.

**Definition of done (any feature)**
- [ ] Matches spec at 360, 768, 1280, 1536px
- [ ] All states designed and built (loading, empty, error, offline, success)
- [ ] Uses tokens only; no one-off values
- [ ] Keyboard and screen reader tested
- [ ] Analytics events implemented and verified
- [ ] SEO metadata and structured data present where relevant
- [ ] Performance budget met
- [ ] Copy reviewed and in the content/i18n files
- [ ] Tests written and passing
- [ ] Docs updated (this brief, Storybook, ADR if architecture changed)

## 26. QA checklist (pre-launch)

- [ ] Cross-browser: Safari iOS, Chrome Android, Chrome/Edge/Firefox/Safari desktop (last 2 versions)
- [ ] Low-end Android device on throttled 3G/4G
- [ ] Dark and light themes, high-contrast mode, 200% zoom, large text
- [ ] Reduced motion
- [ ] Checkout: success, declined card, pending payment, timeout, double-click, back button, refresh mid-payment
- [ ] Sold-out race conditions and hold expiry
- [ ] Email/SMS/WhatsApp deliverability and rendering
- [ ] All redirects, canonical tags, sitemaps, robots
- [ ] Structured data validated
- [ ] Analytics and consent verified
- [ ] 404/500/maintenance pages
- [ ] Security headers, dependency audit, rate limits
- [ ] Backups, monitoring, alerts, rollback rehearsed
- [ ] Legal pages live and linked
- [ ] Load test for peak on-sale scenario

## 27. Rules for AI coding agents

1. Read this entire file before editing. Re-read the relevant section before each task.
2. Work in the order in Section 25. Do not skip ahead.
3. **Do not touch:** backend logic, database schema, payment and auth logic, or existing copy unless the task says so.
4. Never hard-code colors, spacing, radii, fonts or shadows; use tokens from Section 6. If a needed token is missing, propose it instead of inventing a value.
5. Never copy assets, text, logos or code from the reference site.
6. Every component must include all states, keyboard support and accessible names.
7. Do not invent content, statistics, testimonials, logos, prices or legal claims. Use clearly marked placeholders and log them in `CONTENT_TODO.md`.
8. Do not add dependencies without stating why and checking bundle impact.
9. Prefer simple, readable code over clever abstractions. Match existing conventions.
10. After each task, report: files changed, what was verified, what was not, and any decisions that need a human.
11. If a request conflicts with this brief, stop and ask.
12. Prioritize design quality: make deliberate choices specific to this brand. Review your own output against Section 5 ("Avoid") before finishing.