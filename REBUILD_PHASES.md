# BooksByMax Landing Page — Rebuild Phases

---

## Overview

This plan covers a complete rebuild of the BooksByMax landing page with a broader brand identity, a scalable book management system to support 90+ titles, and a design that works on GitHub Pages now while being ready for a dedicated domain later.

---

## Phase 1: Foundation & Brand Identity

**Goal:** Establish the new brand direction, site structure, and core layout.

| Task | Description |
|------|-------------|
| **Rebrand identity** | Update brand messaging from "Fun Activity Books for Kids" to a broader identity like "BooksByMax Designs — Creative Books for Every Reader" that encompasses kids' coloring books, adult journals, cookbooks, and future categories. |
| **Design system** | Define the color palette, typography (Google Fonts loaded properly), spacing scale, and CSS custom properties (variables) so the entire site is themeable and consistent. |
| **Site structure** | Build the HTML skeleton with semantic sections: sticky navigation bar, hero section, featured books, category sections, about/author section, and footer. |
| **Responsive framework** | Implement mobile-first responsive CSS with breakpoints for mobile, tablet, and desktop. |
| **Meta & SEO foundation** | Add Open Graph tags, Twitter Cards, meta description, favicon, and JSON-LD structured data for the site. |

**Deliverable:** A clean, styled shell of the site with placeholder content, fully responsive, with the new brand identity in place.

---

## Phase 2: Book Data Engine

**Goal:** Create a scalable system for managing and displaying books from a data file, so adding new books is as simple as updating a CSV or JSON file.

| Task | Description |
|------|-------------|
| **Data format design** | Upgrade from the current CSV to a structured JSON file (`books.json`) that supports: title, ASIN, Amazon URLs (US/UK/CA/AU), category, subcategory, age range, description, cover filename, featured flag, display order, sales count, rating, and price. |
| **Book renderer (JavaScript)** | Build a lightweight JS engine that reads `books.json` and dynamically renders book cards into the appropriate category sections. No framework needed — vanilla JS to keep it GitHub Pages compatible. |
| **Featured books logic** | Books flagged as `featured: true` in the JSON automatically appear in the Featured section. Top 3-6 books by sales or manual priority. |
| **Category auto-generation** | Categories are derived from the data — if you add a book with a new category, a new section appears automatically. No HTML editing required. |
| **Add-a-book workflow** | Document the simple process: (1) add cover image to `assets/covers/`, (2) add a row to `books.json`, (3) commit and push. The site rebuilds automatically via GitHub Pages. |

**Deliverable:** A working data-driven book display system. Adding a new book requires only a JSON entry and a cover image.

---

## Phase 3: Book Cards & Visual Polish

**Goal:** Design and implement beautiful, conversion-optimized book cards and section layouts.

| Task | Description |
|------|-------------|
| **Book card design** | Create polished book cards featuring: actual cover image with shadow/tilt hover effect, title, age range badge, star rating display, price, and multi-marketplace Amazon buttons (US/UK/CA/AU flags or dropdown). |
| **Category sections** | Style each category with its own color accent while maintaining overall brand cohesion. Include category icon, description, and book count. |
| **Cover image optimization** | Implement lazy loading, proper aspect ratios, and WebP format with JPG fallback for all cover images. |
| **Animations & micro-interactions** | Add smooth scroll behavior, card hover animations (subtle lift + shadow), section fade-in on scroll, and button hover states. |
| **Empty state handling** | Graceful handling when a category has few books or a cover image is missing. |

**Deliverable:** A visually polished, animated book browsing experience with all current books displayed with real covers and Amazon links.

---

## Phase 4: Navigation, Filtering & Search

**Goal:** Make it easy for visitors to find books across a catalog of 90+ titles.

| Task | Description |
|------|-------------|
| **Sticky navigation** | Fixed top nav with brand name, category links (smooth scroll), and a primary CTA button. Collapses to hamburger menu on mobile. |
| **Category filtering** | Tab-based or button-based filtering that shows/hides books by category without page reload. "All Books" option to see everything. |
| **Age range filtering** | Secondary filter for age groups (Toddler, Kids 1-4, Kids 5-8, All Ages, Adults) since your catalog spans multiple audiences. |
| **Search functionality** | Simple client-side search that filters books by title or description as the user types. Essential for 90+ books. |
| **Sort options** | Allow sorting by: popularity (sales), rating, newest, or alphabetical. |
| **Pagination or "Load More"** | For 90+ books, implement either pagination or a "Load More" button to keep initial page load fast. |

**Deliverable:** A fully navigable catalog experience that scales gracefully to 100+ books.

---

## Phase 5: Content, Social Proof & Conversion

**Goal:** Add the content and trust elements that drive clicks to Amazon.

| Task | Description |
|------|-------------|
| **Author/About section** | Professional author bio section with your story, mission, and a photo placeholder. Builds trust and personal connection. |
| **Social proof** | Total books sold counter in the hero, individual book ratings, and a testimonials section (can pull select Amazon reviews). |
| **Newsletter/contact** | Email signup form (can integrate with Mailchimp or similar later) for new book announcements. Simple contact form or email link for now. |
| **Multi-marketplace support** | Country detection or manual selector so visitors see the right Amazon store link for their region (US, UK, CA, AU). |
| **Social sharing** | Share buttons on individual book cards and proper Open Graph images so books look great when shared on social media. |
| **Footer** | Professional footer with copyright, social media links, Amazon author page link, privacy policy link, and category quick links. |

**Deliverable:** A complete, conversion-optimized landing page ready to drive traffic to Amazon.

---

## Phase 6: Domain Readiness & Launch Polish

**Goal:** Prepare the site for the eventual move to a dedicated domain and final quality assurance.

| Task | Description |
|------|-------------|
| **Domain-ready configuration** | Set up the `CNAME` file and document the process for connecting a custom domain to GitHub Pages. All internal links use relative paths. |
| **Performance audit** | Optimize total page weight, image sizes, and load times. Target under 3 seconds on mobile. |
| **Cross-browser testing** | Verify the site works on Chrome, Safari, Firefox, and Edge, plus iOS and Android mobile browsers. |
| **Accessibility** | Add proper alt text for all images, ARIA labels, keyboard navigation, and sufficient color contrast. |
| **Analytics** | Add Google Analytics (or similar) tracking code so you can measure traffic and clicks to Amazon. |
| **Documentation** | Final README with: how to add books, how to update featured books, how to connect a custom domain, and how to update content. |

**Deliverable:** A production-ready, performant, accessible landing page with clear documentation for ongoing maintenance.

---

## Book Onboarding Plan

To get your 90+ books onto the site, here's the process:

| Step | What You Provide | What I Do |
|------|-----------------|-----------|
| 1 | A list or spreadsheet of all ~100 books with: title, ASIN, category, age range, and description | Convert to the `books.json` format |
| 2 | Cover images for each book (JPG or PNG) | Optimize and add to `assets/covers/` |
| 3 | Which books should be "Featured" (your top 3-6 sellers) | Flag them in the data file |
| 4 | Any new categories beyond Coloring Books, Journals, Cookbooks | Add to the category system |

Once the data engine is built in Phase 2, adding the remaining 90 books is a bulk data entry task — not a code change.

---

## Summary

| Phase | Focus | Depends On |
|-------|-------|------------|
| Phase 1 | Foundation & Brand Identity | — |
| Phase 2 | Book Data Engine | Phase 1 |
| Phase 3 | Book Cards & Visual Polish | Phase 2 |
| Phase 4 | Navigation, Filtering & Search | Phase 3 |
| Phase 5 | Content, Social Proof & Conversion | Phase 4 |
| Phase 6 | Domain Readiness & Launch Polish | Phase 5 |

Each phase builds on the previous one, and the site is functional and deployable after every phase. You can review and provide feedback at each stage before we move forward.
