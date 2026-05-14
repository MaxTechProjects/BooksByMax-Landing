/**
 * BooksByMax Designs — Book Data Engine
 * Phase 2: Book Data Engine
 *
 * Loads books.json and dynamically renders:
 *   - Featured books section (books flagged featured: true)
 *   - Category sections (auto-generated from category data)
 *   - Book cards with real covers, meta, and Amazon links
 *
 * Vanilla JS only — no frameworks, GitHub Pages compatible.
 * Works via fetch() from the same origin (local file:// not supported;
 * use a local server or deploy to GitHub Pages).
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  const CONFIG = {
    /** Path to the books data file, relative to index.html */
    dataUrl: 'books.json',

    /** Maximum featured books to show (0 = show all flagged) */
    maxFeatured: 3,

    /** Seasonal featured rotation config */
    seasonalFeatured: {
      enabled: true,
      /** Map of season_tag to the months when that season should be promoted (1-12) */
      seasons: {
        christmas:    { months: [10, 11, 12], label: '🎄 Christmas Picks' },
        halloween:    { months: [9, 10], label: '🎃 Halloween Picks' },
        thanksgiving: { months: [10, 11], label: '🦃 Thanksgiving Picks' },
        fall:         { months: [9, 10, 11], label: '🍂 Fall Favorites' },
        easter:       { months: [2, 3, 4], label: '🐣 Easter Picks' },
        spring:       { months: [3, 4, 5], label: '🌸 Spring Picks' },
        mothers_day:  { months: [4, 5], label: '💐 Mother\'s Day Picks' }
      }
    },

    /** Default Amazon marketplace to use for primary CTA */
    defaultMarketplace: 'us',

    /** Marketplace display labels and flag emojis */
    marketplaces: {
      us: { label: 'Amazon US', flag: '🇺🇸', short: 'US' },
      uk: { label: 'Amazon UK', flag: '🇬🇧', short: 'UK' },
      ca: { label: 'Amazon CA', flag: '🇨🇦', short: 'CA' },
      au: { label: 'Amazon AU', flag: '🇦🇺', short: 'AU' }
    },

    /** Placeholder cover shown when cover_filename is missing */
    placeholderCover: null,

    /** Covers directory path */
    coversDir: 'assets/covers/'
  };


  /* ============================================================
     UTILITY HELPERS
     ============================================================ */

  /** Escape HTML special characters to prevent XSS */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Format a number with commas: 3308 → "3,308" */
  function fmtNum(n) {
    return Number(n).toLocaleString();
  }

  /** Render star rating as filled/half/empty star characters */
  function renderStars(rating) {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  /** Generate a slug-safe CSS class from a category id */
  function categoryClass(id) {
    return 'category-section--' + id.replace(/[^a-z0-9-]/g, '-');
  }

  /** Slugify a string for use as an HTML id */
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }


  /* ============================================================
     CARD TEMPLATES
     ============================================================ */

  /**
   * Build the cover <img> or placeholder div for a book.
   * @param {object} book
   * @param {string} size  'featured' | 'card'
   * @returns {string} HTML string
   */
  function buildCoverHTML(book, size) {
    const isFeatured = size === 'featured';
    const w = isFeatured ? 200 : 160;
    const h = isFeatured ? 264 : 210;

    if (book.cover_filename) {
      return `<img
        src="${esc(CONFIG.coversDir + book.cover_filename)}"
        alt="${esc(book.title)} — book cover"
        loading="lazy"
        width="${w}"
        height="${h}"
        onerror="this.parentElement.innerHTML=this.parentElement.dataset.placeholder"
      >`;
    }

    // Placeholder
    return `<div class="book-cover-placeholder" aria-hidden="true">
      📚
      <span>Cover Coming Soon</span>
    </div>`;
  }

  /**
   * Build the multi-marketplace Amazon button row.
   * Primary button = default marketplace.
   * Secondary links = remaining marketplaces.
   * @param {object} book
   * @param {string} layout  'featured' | 'card'
   * @returns {string} HTML string
   */
  function buildAmazonButtons(book, layout) {
    const urls = book.amazon_urls || {};
    const primary = CONFIG.defaultMarketplace;
    const primaryUrl = urls[primary];

    if (!primaryUrl) return '';

    const primaryMkt = CONFIG.marketplaces[primary];

    if (layout === 'card') {
      return `<a
        href="${esc(primaryUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--amazon btn--sm"
        aria-label="Buy ${esc(book.title)} on ${primaryMkt.label}"
      >View on Amazon</a>`;
    }

    // Featured layout: primary + secondary marketplace links
    const secondaryLinks = Object.entries(CONFIG.marketplaces)
      .filter(([key]) => key !== primary && urls[key])
      .map(([key, mkt]) => `<a
          href="${esc(urls[key])}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--outline btn--sm"
          aria-label="Buy on ${mkt.label}"
          title="${mkt.label}"
        >${mkt.flag} ${mkt.short}</a>`)
      .join('');

    return `
      <a
        href="${esc(primaryUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--amazon"
        aria-label="Buy ${esc(book.title)} on ${primaryMkt.label}"
      >${primaryMkt.flag} Buy on ${primaryMkt.label}</a>
      ${secondaryLinks ? `<div class="featured-card-secondary-links">${secondaryLinks}</div>` : ''}
    `;
  }

  /**
   * Render a featured book card.
   * @param {object} book
   * @param {number} delay  Animation delay index (1-4)
   * @returns {string} HTML string
   */
  function renderFeaturedCard(book, delay) {
    const delayClass = delay ? ` fade-in-delay-${Math.min(delay, 4)}` : '';
    const badge = book.featured_badge
      ? `<div class="featured-card-badge">
           <span class="badge badge--${slugify(book.featured_badge)}">${esc(book.featured_badge)}</span>
         </div>`
      : '';

    const rating = book.rating
      ? `<span class="meta-tag" title="${book.rating}/5 stars">${renderStars(book.rating)} ${book.rating}/5</span>`
      : '';

    const ageTag = book.age_range
      ? `<span class="meta-tag">${esc(book.age_range)}</span>`
      : '';

    const salesTag = book.sales_count
      ? `<span class="meta-tag">${fmtNum(book.sales_count)} sold</span>`
      : '';

    return `
      <article class="featured-card fade-in${delayClass}" aria-label="${esc(book.title)}" data-book-id="${esc(book.id)}">
        ${badge}
        <div class="book-cover-wrap" data-placeholder='<div class="book-cover-placeholder" aria-hidden="true">📚<span>Cover Coming Soon</span></div>'>
          ${buildCoverHTML(book, 'featured')}
        </div>
        <h3 class="featured-card-title">${esc(book.title)}</h3>
        <p class="featured-card-desc">${esc(book.description)}</p>
        <div class="featured-card-meta">
          ${ageTag}
          ${salesTag}
          ${rating}
        </div>
        <div class="featured-card-actions">
          ${buildAmazonButtons(book, 'featured')}
        </div>
      </article>
    `;
  }

  /**
   * Build small marketplace flag links for book cards.
   * Shows flag icons for all available marketplaces beyond the primary.
   * @param {object} book
   * @returns {string} HTML string
   */
  function buildMarketplaceFlags(book) {
    const urls = book.amazon_urls || {};
    const primary = CONFIG.defaultMarketplace;
    const flags = Object.entries(CONFIG.marketplaces)
      .filter(([key]) => key !== primary && urls[key])
      .map(([key, mkt]) => `<a
        href="${esc(urls[key])}"
        target="_blank"
        rel="noopener noreferrer"
        class="marketplace-flag"
        aria-label="Buy on ${mkt.label}"
        title="${mkt.label}"
      >${mkt.flag}</a>`)
      .join('');

    return flags ? `<div class="book-card-marketplaces">${flags}</div>` : '';
  }

  /**
   * Render a standard book card (used in category grids).
   * @param {object} book
   * @param {number} delay  Animation delay index (1-4)
   * @returns {string} HTML string
   */
  function renderBookCard(book, delay) {
    const delayClass = delay ? ` fade-in-delay-${((delay - 1) % 4) + 1}` : '';

    const ratingHTML = book.rating
      ? `<div class="book-card-rating">
           <span class="book-card-stars" title="${book.rating}/5 stars">${renderStars(book.rating)}</span>
           <span class="book-card-rating-num">${book.rating}</span>
           ${book.review_count ? `<span class="book-card-reviews">(${fmtNum(book.review_count)})</span>` : ''}
         </div>`
      : '';

    const priceHTML = book.price_usd
      ? `<div class="book-card-price">$${book.price_usd.toFixed(2)}</div>`
      : '';

    const marketplaceFlags = buildMarketplaceFlags(book);

    return `
      <article class="book-card fade-in${delayClass}" aria-label="${esc(book.title)}" data-book-id="${esc(book.id)}">
        <div class="book-card-cover" data-placeholder='<div class="book-cover-placeholder" aria-hidden="true">📚<span>Cover Coming Soon</span></div>'>
          ${buildCoverHTML(book, 'card')}
        </div>
        <h3 class="book-card-title">${esc(book.title)}</h3>
        <p class="book-card-meta">${esc(book.age_range || '')}${book.age_range && book.category ? ' &bull; ' : ''}${esc(book.subcategory || '')}</p>
        ${ratingHTML}
        ${priceHTML}
        <div class="book-card-actions">
          ${buildAmazonButtons(book, 'card')}
          ${marketplaceFlags}
        </div>
      </article>
    `;
  }

  /**
   * Render a complete category section (header + books grid).
   * @param {object} category  Category object from books.json
   * @param {Array}  books     Books belonging to this category
   * @returns {string} HTML string
   */
  function renderCategorySection(category, books) {
    if (!books || books.length === 0) return '';

    const catId = esc(category.id);
    const headingId = `${catId}-heading`;
    const cssTheme = categoryClass(category.id);
    const sortedBooks = [...books].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

    const bookCards = sortedBooks
      .map((book, i) => renderBookCard(book, i + 1))
      .join('');

    return `
      <section class="category-section ${cssTheme}" id="${catId}" aria-labelledby="${headingId}" data-category="${catId}">
        <div class="container">
          <div class="category-header fade-in">
            <div class="category-icon-wrap" aria-hidden="true">${esc(category.icon || '📚')}</div>
            <div class="category-header-text">
              <span class="category-label">Category</span>
              <h2 class="category-name" id="${headingId}">${esc(category.label)}</h2>
              <p class="category-desc">${esc(category.description || '')}</p>
              <span class="category-count">${books.length} title${books.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          <div class="books-grid">
            ${bookCards}
          </div>
        </div>
      </section>
    `;
  }


  /* ============================================================
     NAV UPDATER
     ============================================================ */

  /**
   * Inject category nav links into both desktop and mobile nav
   * based on the categories in books.json.
   * @param {Array} categories
   */
  function updateNavLinks(categories) {
    const desktopNav = document.querySelector('.nav-links');
    const mobileNav = document.querySelector('.nav-mobile-links');

    if (!desktopNav && !mobileNav) return;

    // Build the dynamic category links (skip "Featured" — it's always first)
    const categoryLinks = categories
      .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
      .map(cat => ({
        href: `#${cat.id}`,
        label: cat.label
      }));

    const allLinks = [
      { href: '#featured', label: 'Featured' },
      ...categoryLinks,
      { href: '#about', label: 'About' }
    ];

    if (desktopNav) {
      desktopNav.innerHTML = allLinks
        .map(l => `<li><a href="${esc(l.href)}" class="nav-link">${esc(l.label)}</a></li>`)
        .join('');
    }

    if (mobileNav) {
      mobileNav.innerHTML = allLinks
        .map(l => `<li><a href="${esc(l.href)}" class="nav-mobile-link">${esc(l.label)}</a></li>`)
        .join('');
    }
  }


  /* ============================================================
     FEATURED SECTION RENDERER
     ============================================================ */

  /**
   * Determine which seasons are currently active based on the current month.
   * @returns {Array} Array of { tag, label } objects for active seasons
   */
  function getActiveSeasons() {
    if (!CONFIG.seasonalFeatured.enabled) return [];

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const active = [];

    for (const [tag, config] of Object.entries(CONFIG.seasonalFeatured.seasons)) {
      if (config.months.includes(currentMonth)) {
        active.push({ tag, label: config.label });
      }
    }

    return active;
  }

  /**
   * Populate the #featured section with seasonal or bestseller books.
   * Shows 3 books at a time. If a season is active, prioritizes seasonal books.
   * Falls back to manually flagged featured books when no season applies.
   * @param {Array} books  All books from books.json
   */
  function renderFeaturedSection(books) {
    const container = document.getElementById('featured');
    if (!container) return;

    const grid = container.querySelector('.featured-grid');
    if (!grid) return;

    const maxBooks = CONFIG.maxFeatured || 3;
    let featured = [];
    let seasonLabel = '';

    // Check for active seasons
    const activeSeasons = getActiveSeasons();

    if (activeSeasons.length > 0) {
      // Get books matching any active season, prioritize by first active season
      for (const season of activeSeasons) {
        const seasonalBooks = books.filter(b => b.season_tag === season.tag);
        if (seasonalBooks.length > 0) {
          featured = seasonalBooks
            .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
            .slice(0, maxBooks);
          seasonLabel = season.label;
          break; // Use the first matching season with available books
        }
      }
    }

    // Fallback: if no seasonal books found, use manually flagged featured books
    if (featured.length === 0) {
      featured = books
        .filter(b => b.featured === true)
        .sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return (a.display_order || 99) - (b.display_order || 99);
          }
          return (b.sales_count || 0) - (a.sales_count || 0);
        })
        .slice(0, maxBooks);
      seasonLabel = '';
    }

    if (featured.length === 0) {
      container.style.display = 'none';
      return;
    }

    grid.innerHTML = featured
      .map((book, i) => renderFeaturedCard(book, i + 1))
      .join('');

    // Update subtitle based on whether seasonal or default
    const subtitle = container.querySelector('.section-subtitle');
    if (subtitle) {
      if (seasonLabel) {
        subtitle.textContent = `${seasonLabel} — Seasonal favorites perfect for right now, available on Amazon worldwide.`;
      } else {
        subtitle.textContent = `Our most-loved titles — bestsellers and reader favorites across every category, available on Amazon US, UK, Canada, and Australia.`;
      }
    }

    // Update section eyebrow if seasonal
    const eyebrow = container.querySelector('.section-eyebrow');
    if (eyebrow && seasonLabel) {
      eyebrow.textContent = 'Seasonal Picks';
    } else if (eyebrow) {
      eyebrow.textContent = 'Top Picks';
    }
  }


  /* ============================================================
     CATEGORY SECTIONS RENDERER
     ============================================================ */

  /**
   * Auto-generate category sections and inject them into the DOM.
   * Replaces any existing hardcoded category sections.
   * @param {Array} categories
   * @param {Array} books
   */
  function renderCategorySections(categories, books) {
    // Find the insertion point: between #featured section and #about section
    const aboutSection = document.getElementById('about');
    const ctaBanner = document.querySelector('.cta-banner');

    // Determine where to insert: before .cta-banner (or before #about if no banner)
    const insertBefore = ctaBanner || aboutSection;
    if (!insertBefore) return;

    // Remove all existing hardcoded category sections
    document.querySelectorAll('[data-category], .category-section').forEach(el => el.remove());

    // Sort categories by display_order
    const sortedCats = [...categories].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

    // Build and insert each category section
    sortedCats.forEach(category => {
      const categoryBooks = books
        .filter(b => b.category === category.id)
        .sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

      if (categoryBooks.length === 0) return;

      const html = renderCategorySection(category, categoryBooks);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html.trim();
      const section = wrapper.firstChild;

      insertBefore.parentNode.insertBefore(section, insertBefore);
    });
  }


  /* ============================================================
     HERO STATS UPDATER
     ============================================================ */

  /**
   * Update the hero stats with live data from books.json.
   * @param {Array} categories
   * @param {Array} books
   */
  function updateHeroStats(categories, books) {
    const stats = document.querySelectorAll('.hero-stat');
    if (!stats.length) return;

    const totalTitles = books.length;
    const totalCategories = categories.length;

    const statData = [
      { number: `${totalTitles}+`, label: 'Published Titles' },
      { number: totalCategories, label: 'Book Categories' },
      { number: 4, label: 'Amazon Stores' }
    ];

    stats.forEach((stat, i) => {
      if (!statData[i]) return;
      const numEl = stat.querySelector('.hero-stat-number');
      const labelEl = stat.querySelector('.hero-stat-label');
      if (numEl) numEl.textContent = statData[i].number;
      if (labelEl) labelEl.textContent = statData[i].label;
    });
  }


  /* ============================================================
     HERO BOOK STACK UPDATER
     ============================================================ */

  /**
   * Update the hero visual book stack with top-selling covers.
   * @param {Array} books
   */
  function updateHeroStack(books) {
    const stackSlots = document.querySelectorAll('.hero-book img');
    if (!stackSlots.length) return;

    // Pick top 3 by sales_count
    const topBooks = [...books]
      .filter(b => b.cover_filename)
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 3);

    stackSlots.forEach((img, i) => {
      if (topBooks[i]) {
        img.src = CONFIG.coversDir + topBooks[i].cover_filename;
        img.alt = topBooks[i].title + ' cover';
      }
    });
  }


  /* ============================================================
     ABOUT SECTION STATS UPDATER
     ============================================================ */

  /**
   * Update the about section highlights with live catalog data.
   * @param {Array} categories
   * @param {Array} books
   */
  function updateAboutStats(categories, books) {
    const highlights = document.querySelectorAll('.about-highlight');
    if (!highlights.length) return;

    const data = [
      { number: `${books.length}+`, label: 'Published Titles' },
      { number: 4, label: 'Amazon Marketplaces' },
      { number: categories.length, label: 'Book Categories' },
      { number: '∞', label: 'More Coming Soon' }
    ];

    highlights.forEach((hl, i) => {
      if (!data[i]) return;
      const numEl = hl.querySelector('.about-highlight-number');
      const labelEl = hl.querySelector('.about-highlight-label');
      if (numEl) numEl.textContent = data[i].number;
      if (labelEl) labelEl.textContent = data[i].label;
    });
  }


  /* ============================================================
     FOOTER NAV UPDATER
     ============================================================ */

  /**
   * Update the footer "Books" nav column with live category links.
   * @param {Array} categories
   */
  function updateFooterNav(categories) {
    // Find the footer Books nav (first footer nav after brand)
    const footerNavs = document.querySelectorAll('.site-footer nav');
    if (!footerNavs.length) return;

    const booksNav = footerNavs[0]; // First nav = Books
    const linksList = booksNav.querySelector('.footer-links');
    if (!linksList) return;

    const sortedCats = [...categories].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

    const staticLinks = [
      { href: '#featured', label: 'Featured Titles' },
      { href: 'https://www.amazon.com/s?k=BooksByMax', label: 'All Books on Amazon', external: true }
    ];

    const catLinks = sortedCats.map(cat => ({
      href: `#${cat.id}`,
      label: cat.label
    }));

    const allLinks = [...catLinks, ...staticLinks];

    linksList.innerHTML = allLinks
      .map(l => {
        const ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<li><a href="${esc(l.href)}" class="footer-link"${ext}>${esc(l.label)}</a></li>`;
      })
      .join('');
  }


  /* ============================================================
     SCROLL ANIMATION RE-OBSERVER
     ============================================================ */

  /**
   * Re-observe newly injected .fade-in elements so they animate
   * when they enter the viewport.
   */
  function reObserveFadeIns() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe only elements not yet visible
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
  }


  /* ============================================================
     ERROR STATE
     ============================================================ */

  /**
   * Show a graceful error message if books.json fails to load.
   */
  function showLoadError(message) {
    console.error('[BooksByMax Engine]', message);

    // Show a subtle notice in the featured section
    const featured = document.getElementById('featured');
    if (featured) {
      const grid = featured.querySelector('.featured-grid');
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">
            <p style="font-size:1.1rem;">Unable to load book catalog. Please try refreshing the page.</p>
          </div>
        `;
      }
    }
  }


  /* ============================================================
     MAIN BOOTSTRAP
     ============================================================ */

  /**
   * Main entry point: fetch books.json and orchestrate all rendering.
   */
  async function init() {
    let data;

    try {
      const response = await fetch(CONFIG.dataUrl, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data = await response.json();
    } catch (err) {
      showLoadError(`Failed to fetch ${CONFIG.dataUrl}: ${err.message}`);
      return;
    }

    const books = data.books || [];
    const categories = data.categories || [];

    if (books.length === 0) {
      console.warn('[BooksByMax Engine] No books found in books.json');
      return;
    }

    // Render everything
    updateNavLinks(categories);
    renderFeaturedSection(books);
    renderCategorySections(categories, books);
    updateHeroStats(categories, books);
    updateHeroStack(books);
    updateAboutStats(categories, books);
    updateFooterNav(categories);

    // Re-trigger scroll animations on newly injected elements
    reObserveFadeIns();

    console.info(`[BooksByMax Engine] Rendered ${books.length} books across ${categories.length} categories.`);
  }

  /* ============================================================
     INIT — run after DOM is ready
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
