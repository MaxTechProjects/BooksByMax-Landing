# BooksByMax Designs — Landing Page

A polished, conversion-optimized landing page for **BooksByMax Designs** — creative books for every reader, available on Amazon worldwide.

**Live site:** [maxtechprojects.github.io/BooksByMax-Landing](https://maxtechprojects.github.io/BooksByMax-Landing/)

---

## Features

- **Data-driven catalog** — Books are loaded from `books.json`, no HTML editing needed to add/remove books
- **Dynamic filtering & search** — Category filters, age-range filters, real-time search, and sort options
- **Multi-marketplace support** — Amazon links for US, UK, Canada, and Australia with automatic region detection
- **Testimonials carousel** — Curated reader reviews with auto-rotation
- **Responsive design** — Mobile-first layout that works on all screen sizes
- **SEO optimized** — Open Graph, Twitter Cards, JSON-LD structured data
- **Performance focused** — Lazy loading, minimal JS, no frameworks
- **Accessibility** — ARIA labels, keyboard navigation, skip links, color contrast
- **Google Analytics ready** — Placeholder included, just add your Measurement ID

---

## How to Add a New Book

Adding a book requires **no code changes** — just two steps:

### Step 1: Add the cover image

Save the book cover as a JPG file in `assets/covers/`:

```
assets/covers/your_book_name.jpg
```

**Recommended:** 600×800px, under 200KB, JPG format.

### Step 2: Add a JSON entry

Open `books.json` and add a new entry to the `"books"` array:

```json
{
  "id": "your-book-slug",
  "title": "Your Book Title",
  "asin": "B0XXXXXXXXX",
  "amazon_urls": {
    "us": "https://www.amazon.com/dp/B0XXXXXXXXX",
    "uk": "https://www.amazon.co.uk/dp/B0XXXXXXXXX",
    "ca": "https://www.amazon.ca/dp/B0XXXXXXXXX",
    "au": "https://www.amazon.com.au/dp/B0XXXXXXXXX"
  },
  "category": "coloring-books",
  "subcategory": "Kids Coloring",
  "age_range": "Kids",
  "description": "A brief description of the book.",
  "cover_filename": "your_book_name.jpg",
  "featured": false,
  "featured_badge": null,
  "display_order": 10,
  "sales_count": 0,
  "rating": 0,
  "review_count": 0,
  "price_usd": 7.99,
  "pages": 50,
  "publisher": "BooksByMax Designs",
  "published_year": 2026
}
```

### Step 3: Commit and push

```bash
git add books.json assets/covers/your_book_name.jpg
git commit -m "Add: Your Book Title"
git push origin main
```

The site updates automatically via GitHub Pages.

See `ADD-A-BOOK.md` for the full detailed guide.

---

## How to Update Featured Books

In `books.json`, set `"featured": true` on any book you want in the Featured section. Optionally add a badge:

```json
"featured": true,
"featured_badge": "Best Seller"
```

Badge options: `"Best Seller"`, `"New"`, `"Trending"`, `"Popular"`, or any custom text. Set to `null` for no badge.

---

## How to Add a New Category

Add a new category object to the `"categories"` array in `books.json`:

```json
{
  "id": "activity-books",
  "label": "Activity Books",
  "icon": "🧩",
  "description": "Fun activity books with puzzles, mazes, and games for kids.",
  "color_theme": "activity",
  "display_order": 4
}
```

Then assign books to the new category by setting `"category": "activity-books"` in their entries. The new section appears automatically on the site.

---

## How to Connect a Custom Domain

### Step 1: Buy a domain

Purchase a domain from any registrar (Namecheap, GoDaddy, Google Domains, etc.).

### Step 2: Update the CNAME file

Replace the contents of the `CNAME` file in the repo root with just your domain:

```
www.booksbymax.com
```

### Step 3: Configure DNS

Add these DNS records at your domain registrar:

| Type  | Name | Value                              |
|-------|------|------------------------------------|
| CNAME | www  | maxtechprojects.github.io          |
| A     | @    | 185.199.108.153                    |
| A     | @    | 185.199.109.153                    |
| A     | @    | 185.199.110.153                    |
| A     | @    | 185.199.111.153                    |

### Step 4: Enable HTTPS

In GitHub repo Settings → Pages → Custom domain, enter your domain and check "Enforce HTTPS."

### Step 5: Update URLs

Search and replace `maxtechprojects.github.io/BooksByMax-Landing` with your domain in:
- `index.html` (canonical URL, Open Graph, Twitter Card, JSON-LD)

---

## How to Set Up Google Analytics

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. In `index.html`, replace both instances of `GA_MEASUREMENT_ID` with your actual ID

---

## How to Update Content

| What to update | Where to edit |
|----------------|---------------|
| Book catalog | `books.json` |
| Author bio | `index.html` → About section |
| Testimonials | `assets/js/social-proof.js` → `testimonials` array |
| Newsletter form | `index.html` → CTA banner section |
| Social media links | `index.html` → Footer social links |
| Site colors/fonts | `assets/css/styles.css` → CSS custom properties at top |

---

## Project Structure

```
BooksByMax-Landing/
├── index.html                    # Main page
├── books.json                    # Book catalog data
├── CNAME                         # Custom domain config
├── README.md                     # This file
├── ADD-A-BOOK.md                 # Detailed add-a-book guide
├── assets/
│   ├── css/
│   │   └── styles.css            # All styles (design system + components)
│   ├── js/
│   │   ├── books-engine.js       # Data engine: loads & renders books
│   │   ├── catalog-controls.js   # Filtering, search, sort, pagination
│   │   ├── social-proof.js       # Testimonials, region detection, sharing
│   │   └── main.js               # Nav, scroll, animations
│   └── covers/                   # Book cover images
│       ├── dinosaur_kids_coloring.jpg
│       ├── prayer_journal_women.jpg
│       └── ...
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Pages auto-deployment
```

---

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** — No frameworks, no build step
- **GitHub Pages** — Free hosting with auto-deployment
- **Google Fonts** — Playfair Display, Nunito, Caveat

---

## Browser Support

- Chrome 80+
- Safari 14+
- Firefox 78+
- Edge 80+
- iOS Safari 14+
- Android Chrome 80+

---

## Development

All work happens on the `MaxDev` branch. Only merge to `main` when changes are tested and approved — `main` is what GitHub Pages deploys.

```bash
# Clone and switch to dev branch
git clone https://github.com/MaxTechProjects/BooksByMax-Landing.git
cd BooksByMax-Landing
git checkout MaxDev

# Make changes, then commit
git add -A
git commit -m "Your change description"
git push origin MaxDev

# When ready to deploy: merge to main
git checkout main
git merge MaxDev
git push origin main
```

---

## License

© 2025 BooksByMax Designs. All rights reserved. All book content and cover images are copyright BooksByMax Designs.
