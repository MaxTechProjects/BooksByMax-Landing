# BooksByMax Landing — Feature List

> **Project:** BooksByMax Author Landing Page
> **Status:** 🟢 Live (GitHub Pages — booksbymax.com)
> **Stack:** Static HTML + CSS + Vanilla JS + GitHub Pages
> **Last updated:** 2026-06-25

---

## 🟢 Base Features (Currently Live)

### Site Structure
- **Single-page landing** with hero, featured books, about, testimonials, newsletter CTA, footer
- **5 category pages:** Coloring Books, Story Books, Journals, Cookbooks, Notebooks
- **Navigation:** Sticky nav bar + mobile hamburger menu with full category links
- **Footer:** Social links, contact, Amazon store links (US, UK, CA, AU), copyright

### Book Catalog
- **102 books** loaded dynamically from `books.json` (v2.0 schema)
- **5 categories** with subcategories (seasonal: Christmas, Easter, Halloween, Thanksgiving)
- **JSON-driven rendering** — all book data in structured JSON, no hardcoded HTML per book
- **Featured books section** on home page with random rotation
- **Category pages** with full grid of all books in that category
- **Sorting:** sort by title, price, rating, release date, popularity
- **Book cards** with cover image, title, price, rating stars, Amazon button
- **Book detail modals** — click a book card for full info (description, specs, formats)
- **Subcategory filtering** — filter category pages by subcategory (e.g., "Christmas coloring books")

### Search & Discovery
- **Site search** powered by structured JSON data
- **Auto-suggest** on search input
- **SEO-friendly** URLs and metadata

### Amazon Integration
- **Direct Amazon links** per book (deep-links by ASIN)
- **Multi-region store links:** Amazon US, UK, CA, AU
- **Structured author store** badge linking to author page
- **Price display** per book

### Design & UX
- **Purple-based color theme** (#6b21a8 primary)
- **Responsive design** — works on mobile, tablet, desktop
- **Dark/light mode toggle** with system preference detection
- **Smooth scroll** navigation
- **Fade-in animations** on scroll for sections
- **Hero section** with book stack visual, category badges, CTA
- **Stats display:** number of books, happy readers, designs (hardcoded)
- **Book stack visual** — 3D-layered book renderings in hero

### About Section
- Author bio with avatar and description
- Highlights: 100+ designs, years creating, worldwide readers, Amazon KDP author

### Newsletter Signup
- Email input field (currently static — no backend integration)
- CTA banner section encouraging signup

### Testimonials / Social Proof
- Review/testimonial display section
- Social proof badges

### Technical Features
- **Semantic HTML5** with ARIA labels for accessibility
- **Open Graph + Twitter Card** meta tags for social sharing
- **Schema.org structured data** (WebSite, Person, ItemList with ratings)
- **Google Analytics** (GA4 tag) — placeholder ID
- **JSON-LD** for search engine rich results
- **Favicon** (SVG inline + ICO + Apple touch icon)
- **Canonical URL** set for SEO
- **Robots.txt** configured
- **Custom 404 page** handling
- **Optimized cover images** in `assets/covers/`
- **`books.json` as single data source** — add a book, update JSON, it appears site-wide
- **`ADD-A-BOOK.md`** guide for adding new books without coding

### Category Page Features (All 5 Categories)
- Category hero banner with gradient background
- Dynamic book count display
- Sort/filter controls
- Responsive grid layout
- Loading state spinner
- Book modals with full details
- Amazon deep-link for each book

---

## 🟡 Enhancement Features (Planned / Incomplete)

| Feature | Status | Notes |
|---------|--------|-------|
| **Newsletter backend** | 🔴 Not connected | Email input exists but no integration (Mailchimp, ConvertKit, etc.) |
| **Real contact form** | 🔴 Not implemented | `mailto:` link only — no form submission endpoint |
| **Blog / articles** | 🔴 Not started | No blog section or CMS integration |
| **Author analytics dashboard** | 🔴 Not started | Only GA4 tag placeholder installed |
| **International pricing** | 🟡 Partial | Multi-region Amazon links exist but prices shown are USD only |
| **Cart / direct purchase** | 🔴 Not started | All sales routed through Amazon — no direct checkout |
| **GDPR/cookie consent** | 🔴 Not implemented | GA tag present but no consent banner |
| **PWA / offline support** | 🔴 Not started | Static site but no service worker |
| **Book previews** | 🔴 Not started | No flipbook or PDF preview of book interiors |
| **Author blog / updates** | 🔴 Not started | No content management for news or new releases |
