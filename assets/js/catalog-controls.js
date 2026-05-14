/**
 * BooksByMax Designs — Catalog Controls
 * Phase 4: Navigation, Filtering & Search
 *
 * Adds interactive catalog browsing:
 *   - Category tab filtering
 *   - Age range filtering
 *   - Real-time search by title/description
 *   - Sort options (popularity, rating, newest, A-Z)
 *   - "Load More" pagination for large catalogs
 *
 * Vanilla JS only — no frameworks, GitHub Pages compatible.
 * Depends on books-engine.js being loaded first (uses the same data).
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  const CATALOG_CONFIG = {
    /** Number of books to show per page/load */
    booksPerPage: 12,

    /** Debounce delay for search input (ms) */
    searchDebounce: 250,

    /** Data URL (same as books-engine) */
    dataUrl: 'books.json',

    /** Covers directory */
    coversDir: 'assets/covers/',

    /** Default marketplace */
    defaultMarketplace: 'us',

    /** Marketplace info */
    marketplaces: {
      us: { label: 'Amazon US', flag: '🇺🇸', short: 'US' },
      uk: { label: 'Amazon UK', flag: '🇬🇧', short: 'UK' },
      ca: { label: 'Amazon CA', flag: '🇨🇦', short: 'CA' },
      au: { label: 'Amazon AU', flag: '🇦🇺', short: 'AU' }
    }
  };

  /* ============================================================
     STATE
     ============================================================ */
  let allBooks = [];
  let allCategories = [];
  let filteredBooks = [];
  let currentCategory = 'all';
  let currentSubcategory = 'all';
  let currentAgeRange = 'all';
  let currentSort = 'popularity';
  let currentSearch = '';
  let visibleCount = CATALOG_CONFIG.booksPerPage;

  /* ============================================================
     UTILITY HELPERS (duplicated from books-engine for independence)
     ============================================================ */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fmtNum(n) {
    return Number(n).toLocaleString();
  }

  function renderStars(rating) {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ============================================================
     BUILD CATALOG CONTROLS UI
     ============================================================ */

  /**
   * Inject the catalog controls section into the DOM
   * between the featured section and the first category section.
   */
  function buildCatalogUI(categories) {
    // Check if already built
    if (document.getElementById('catalog-controls')) return;

    // Find insertion point: after featured section
    const featuredSection = document.getElementById('featured');
    if (!featuredSection) return;

    // Derive unique age ranges from the data
    const ageRanges = [...new Set(allBooks.map(b => b.age_range).filter(Boolean))];

    const controlsHTML = `
      <section class="catalog-section section" id="catalog" aria-labelledby="catalog-heading">
        <div class="container">

          <header class="section-header fade-in">
            <span class="section-eyebrow">Browse</span>
            <h2 class="section-title" id="catalog-heading">All Books</h2>
            <p class="section-subtitle">
              Explore our full catalog — filter by category, age range, or search for something specific.
            </p>
          </header>

          <!-- Controls bar -->
          <div class="catalog-controls" id="catalog-controls" role="toolbar" aria-label="Book catalog filters">

            <!-- Search -->
            <div class="catalog-search">
              <label for="catalog-search-input" class="sr-only">Search books</label>
              <input
                type="search"
                id="catalog-search-input"
                class="catalog-search-input"
                placeholder="Search by title or description..."
                autocomplete="off"
                aria-label="Search books by title or description"
              >
              <span class="catalog-search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>

            <!-- Category filters -->
            <div class="catalog-filters" role="group" aria-label="Filter by category">
              <button class="catalog-filter-btn active" data-category="all" aria-pressed="true">All Books</button>
              ${categories.map(cat => `<button class="catalog-filter-btn" data-category="${esc(cat.id)}" aria-pressed="false">${esc(cat.icon)} ${esc(cat.label)}</button>`).join('')}
            </div>

            <!-- Subcategory / Seasonal filters (shown when a category with subcategories is selected) -->
            <div class="catalog-subcategory-filters" id="catalog-subcategory-filters" role="group" aria-label="Filter by theme or season" style="display:none;">
            </div>

            <!-- Age range filters -->
            <div class="catalog-age-filters" role="group" aria-label="Filter by age range">
              <button class="catalog-age-btn active" data-age="all" aria-pressed="true">All Ages</button>
              ${ageRanges.map(age => `<button class="catalog-age-btn" data-age="${esc(age)}" aria-pressed="false">${esc(age)}</button>`).join('')}
            </div>

            <!-- Sort -->
            <div class="catalog-sort">
              <label for="catalog-sort-select" class="catalog-sort-label">Sort by:</label>
              <select id="catalog-sort-select" class="catalog-sort-select" aria-label="Sort books">
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="az">A → Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

          </div>

          <!-- Results info -->
          <div class="catalog-results-info" id="catalog-results-info" aria-live="polite" aria-atomic="true">
            <span id="catalog-results-count"></span>
          </div>

          <!-- Books grid -->
          <div class="catalog-grid" id="catalog-grid" aria-label="Book catalog results">
          </div>

          <!-- Load More button -->
          <div class="catalog-load-more" id="catalog-load-more">
            <button class="btn btn--primary btn--lg catalog-load-more-btn" id="catalog-load-more-btn">
              Load More Books
            </button>
            <p class="catalog-load-more-info" id="catalog-load-more-info"></p>
          </div>

        </div>
      </section>
    `;

    // Insert after featured section
    featuredSection.insertAdjacentHTML('afterend', controlsHTML);
  }

  /* ============================================================
     RENDER CATALOG BOOK CARD
     ============================================================ */
  function renderCatalogCard(book, index) {
    const delayClass = ` fade-in-delay-${((index) % 4) + 1}`;
    const coverHTML = book.cover_filename
      ? `<img src="${esc(CATALOG_CONFIG.coversDir + book.cover_filename)}" alt="${esc(book.title)} — book cover" loading="lazy" width="160" height="210" onerror="this.parentElement.innerHTML=this.parentElement.dataset.placeholder">`
      : `<div class="book-cover-placeholder" aria-hidden="true">📚<span>Cover Coming Soon</span></div>`;

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

    const urls = book.amazon_urls || {};
    const primaryUrl = urls[CATALOG_CONFIG.defaultMarketplace] || '';
    const primaryBtn = primaryUrl
      ? `<a href="${esc(primaryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--amazon btn--sm" aria-label="Buy ${esc(book.title)} on Amazon">View on Amazon</a>`
      : '';

    const flags = Object.entries(CATALOG_CONFIG.marketplaces)
      .filter(([key]) => key !== CATALOG_CONFIG.defaultMarketplace && urls[key])
      .map(([key, mkt]) => `<a href="${esc(urls[key])}" target="_blank" rel="noopener noreferrer" class="marketplace-flag" aria-label="Buy on ${mkt.label}" title="${mkt.label}">${mkt.flag}</a>`)
      .join('');
    const flagsHTML = flags ? `<div class="book-card-marketplaces">${flags}</div>` : '';

    return `
      <article class="book-card fade-in${delayClass}" aria-label="${esc(book.title)}" data-book-id="${esc(book.id)}">
        <div class="book-card-cover" data-placeholder='<div class="book-cover-placeholder" aria-hidden="true">📚<span>Cover Coming Soon</span></div>'>
          ${coverHTML}
        </div>
        <h3 class="book-card-title">${esc(book.title)}</h3>
        <p class="book-card-meta">${esc(book.age_range || '')}${book.age_range && book.subcategory ? ' &bull; ' : ''}${esc(book.subcategory || '')}</p>
        ${ratingHTML}
        ${priceHTML}
        <div class="book-card-actions">
          ${primaryBtn}
          ${flagsHTML}
        </div>
      </article>
    `;
  }

  /* ============================================================
     FILTER & SORT LOGIC
     ============================================================ */
  function applyFilters() {
    let books = [...allBooks];

    // Category filter
    if (currentCategory !== 'all') {
      books = books.filter(b => b.category === currentCategory);
    }

    // Subcategory / seasonal filter
    if (currentSubcategory !== 'all') {
      books = books.filter(b => {
        // Match by season_tag or by subcategory name
        return (b.season_tag && b.season_tag === currentSubcategory) ||
               (b.subcategory && b.subcategory.toLowerCase().replace(/[^a-z0-9]/g, '') === currentSubcategory.toLowerCase().replace(/[^a-z0-9]/g, ''));
      });
    }

    // Age range filter
    if (currentAgeRange !== 'all') {
      books = books.filter(b => b.age_range === currentAgeRange);
    }

    // Search filter
    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase().trim();
      books = books.filter(b =>
        (b.title && b.title.toLowerCase().includes(query)) ||
        (b.description && b.description.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (currentSort) {
      case 'popularity':
        books.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      case 'rating':
        books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        books.sort((a, b) => (b.published_year || 0) - (a.published_year || 0));
        break;
      case 'az':
        books.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'price-low':
        books.sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0));
        break;
      case 'price-high':
        books.sort((a, b) => (b.price_usd || 0) - (a.price_usd || 0));
        break;
    }

    filteredBooks = books;
    visibleCount = CATALOG_CONFIG.booksPerPage;
    renderCatalog();
  }

  /* ============================================================
     RENDER CATALOG
     ============================================================ */
  function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const loadMoreWrap = document.getElementById('catalog-load-more');
    const loadMoreInfo = document.getElementById('catalog-load-more-info');
    const resultsCount = document.getElementById('catalog-results-count');

    if (!grid) return;

    const booksToShow = filteredBooks.slice(0, visibleCount);

    if (booksToShow.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty" style="grid-column:1/-1;text-align:center;padding:3rem;">
          <p style="font-size:1.2rem;color:var(--color-text-muted);margin-bottom:0.5rem;">No books found</p>
          <p style="font-size:0.9rem;color:var(--color-text-muted);">Try adjusting your filters or search term.</p>
        </div>
      `;
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    } else {
      grid.innerHTML = booksToShow.map((book, i) => renderCatalogCard(book, i)).join('');

      // Show/hide load more
      if (filteredBooks.length > visibleCount) {
        if (loadMoreWrap) loadMoreWrap.style.display = 'flex';
        if (loadMoreInfo) loadMoreInfo.textContent = `Showing ${visibleCount} of ${filteredBooks.length} books`;
      } else {
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      }
    }

    // Update results count
    if (resultsCount) {
      const total = filteredBooks.length;
      const catLabel = currentCategory === 'all' ? 'all categories' : allCategories.find(c => c.id === currentCategory)?.label || currentCategory;
      resultsCount.textContent = `${total} book${total !== 1 ? 's' : ''} in ${catLabel}`;
    }

    // Re-observe fade-in elements
    reObserveFadeIns();
  }

  function loadMore() {
    visibleCount += CATALOG_CONFIG.booksPerPage;
    renderCatalog();
  }

  /* ============================================================
     RE-OBSERVE FADE-INS
     ============================================================ */
  function reObserveFadeIns() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
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

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  /**
   * Build and show subcategory filter buttons when a category with subcategories is selected.
   */
  function updateSubcategoryFilters() {
    const container = document.getElementById('catalog-subcategory-filters');
    if (!container) return;

    // Find the selected category's subcategories metadata
    const selectedCat = allCategories.find(c => c.id === currentCategory);
    const subcats = selectedCat && selectedCat.subcategories ? selectedCat.subcategories : [];

    // Also derive subcategories from actual book data for this category
    let availableSubcats = [];
    if (currentCategory !== 'all') {
      const booksInCat = allBooks.filter(b => b.category === currentCategory);
      const uniqueSubcats = [...new Set(booksInCat.map(b => b.subcategory).filter(Boolean))];
      const uniqueSeasons = [...new Set(booksInCat.map(b => b.season_tag).filter(Boolean))];

      // Use metadata subcategories if available (they have labels and season info)
      if (subcats.length > 0) {
        availableSubcats = subcats.filter(sc => {
          // Only show subcategories that have matching books
          return booksInCat.some(b => 
            (b.season_tag && b.season_tag === sc.id) ||
            (b.subcategory && b.subcategory.toLowerCase().replace(/[^a-z0-9]/g, '') === sc.id.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );
        });
      } else {
        // Fallback: derive from book subcategory field
        availableSubcats = uniqueSubcats.map(sub => ({
          id: sub.toLowerCase().replace(/[^a-z0-9]/g, ''),
          label: sub
        }));
      }
    }

    if (availableSubcats.length <= 1) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    // Determine which subcategories are "in season" right now
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Build buttons with seasonal highlighting
    let buttonsHTML = `<button class="catalog-subcategory-btn active" data-subcategory="all" aria-pressed="true">All Themes</button>`;
    availableSubcats.forEach(sc => {
      const isInSeason = sc.season_months && sc.season_months.includes(currentMonth);
      const seasonClass = isInSeason ? ' in-season' : '';
      const seasonBadge = isInSeason ? '<span class="season-badge">In Season!</span>' : '';
      buttonsHTML += `<button class="catalog-subcategory-btn${seasonClass}" data-subcategory="${esc(sc.id)}" aria-pressed="false">${esc(sc.label)}${seasonBadge}</button>`;
    });

    container.innerHTML = buttonsHTML;
    container.style.display = 'flex';

    // Bind subcategory button events
    container.querySelectorAll('.catalog-subcategory-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.catalog-subcategory-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentSubcategory = btn.dataset.subcategory;
        applyFilters();
      });
    });
  }

  function bindEvents() {
    // Category filter buttons
    document.querySelectorAll('.catalog-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.catalog-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentCategory = btn.dataset.category;
        currentSubcategory = 'all'; // Reset subcategory when category changes
        updateSubcategoryFilters();
        applyFilters();
      });
    });

    // Age range filter buttons
    document.querySelectorAll('.catalog-age-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.catalog-age-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentAgeRange = btn.dataset.age;
        applyFilters();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        applyFilters();
      });
    }

    // Search input
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      const debouncedSearch = debounce(() => {
        currentSearch = searchInput.value;
        applyFilters();
      }, CATALOG_CONFIG.searchDebounce);

      searchInput.addEventListener('input', debouncedSearch);

      // Clear on Escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          currentSearch = '';
          applyFilters();
        }
      });
    }

    // Load More button
    const loadMoreBtn = document.getElementById('catalog-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', loadMore);
    }
  }

  /* ============================================================
     UPDATE NAV — add "All Books" link
     ============================================================ */
  function addCatalogNavLink() {
    const desktopNav = document.querySelector('.nav-links');
    const mobileNav = document.querySelector('.nav-mobile-links');

    // Insert "All Books" link after "Featured" in desktop nav
    if (desktopNav) {
      const featuredLink = desktopNav.querySelector('a[href="#featured"]');
      if (featuredLink) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#catalog" class="nav-link">All Books</a>';
        featuredLink.closest('li').insertAdjacentElement('afterend', li);
      }
    }

    // Insert in mobile nav
    if (mobileNav) {
      const featuredLink = mobileNav.querySelector('a[href="#featured"]');
      if (featuredLink) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#catalog" class="nav-mobile-link">All Books</a>';
        featuredLink.closest('li').insertAdjacentElement('afterend', li);
      }
    }
  }

  /* ============================================================
     MAIN INIT
     ============================================================ */
  async function init() {
    let data;

    try {
      const response = await fetch(CATALOG_CONFIG.dataUrl, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data = await response.json();
    } catch (err) {
      console.error('[Catalog Controls] Failed to load books.json:', err.message);
      return;
    }

    allBooks = data.books || [];
    allCategories = data.categories || [];

    if (allBooks.length === 0) return;

    // Build UI
    buildCatalogUI(allCategories);

    // Add nav link
    addCatalogNavLink();

    // Initial render
    filteredBooks = [...allBooks];
    applyFilters();

    // Bind events
    bindEvents();

    // Initialize subcategory filters
    updateSubcategoryFilters();

    console.info(`[Catalog Controls] Initialized with ${allBooks.length} books, ${allCategories.length} categories.`);
  }

  /* ============================================================
     INIT — run after DOM is ready
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure books-engine.js runs first
    setTimeout(init, 100);
  }

})();
