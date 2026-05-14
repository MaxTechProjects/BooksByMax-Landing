/**
 * BooksByMax Designs — Social Proof & Conversion
 * Phase 5: Content, Social Proof & Conversion
 *
 * Features:
 *   - Testimonials carousel (curated Amazon reviews)
 *   - Country/region detection for smart Amazon links
 *   - Social share buttons on book cards
 *   - Animated counters for hero stats
 *   - Total books sold aggregation
 *
 * Vanilla JS only — no frameworks, GitHub Pages compatible.
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  const SP_CONFIG = {
    dataUrl: 'books.json',
    /** Testimonials — curated reviews (can be expanded) */
    testimonials: [
      {
        text: "My 3-year-old absolutely loves the dinosaur coloring book! The thick outlines are perfect for little hands. We've already bought two more copies as gifts.",
        author: "Sarah M.",
        source: "Amazon US",
        rating: 5,
        book: "Dinosaur Kids Coloring Book"
      },
      {
        text: "This prayer journal has transformed my daily quiet time. The prompts are thoughtful and the layout gives me plenty of space to write. Beautiful design.",
        author: "Jennifer R.",
        source: "Amazon US",
        rating: 5,
        book: "Prayer Journal For Women"
      },
      {
        text: "Bought this for my toddler and she colors in it every single day. The pages are thick enough that markers don't bleed through. Great quality!",
        author: "David K.",
        source: "Amazon UK",
        rating: 5,
        book: "Dinosaur Toddler Coloring Book"
      },
      {
        text: "I use this recipe book to write down all my grandmother's recipes so they're never lost. The layout is perfect — space for ingredients, steps, and notes.",
        author: "Maria L.",
        source: "Amazon CA",
        rating: 5,
        book: "Recipe Book (Write Your Own)"
      },
      {
        text: "The sermon notes journal keeps me engaged during services. I love how it's structured with space for key verses, reflections, and action items.",
        author: "Grace T.",
        source: "Amazon US",
        rating: 5,
        book: "Sermon Notes Journal For Women"
      },
      {
        text: "My son is obsessed with spiders and this book is perfect for him. Fun illustrations and just the right difficulty level for a 5-year-old.",
        author: "Michael B.",
        source: "Amazon AU",
        rating: 5,
        book: "Spider Coloring Book For Kids"
      }
    ],

    /** Region detection mapping */
    regionMap: {
      US: 'us', CA: 'ca', GB: 'uk', UK: 'uk', AU: 'au',
      NZ: 'au', IE: 'uk', IN: 'us'
    },

    /** Marketplace display info */
    marketplaces: {
      us: { label: 'Amazon.com (US)', flag: '🇺🇸', domain: 'amazon.com' },
      uk: { label: 'Amazon.co.uk (UK)', flag: '🇬🇧', domain: 'amazon.co.uk' },
      ca: { label: 'Amazon.ca (Canada)', flag: '🇨🇦', domain: 'amazon.ca' },
      au: { label: 'Amazon.com.au (Australia)', flag: '🇦🇺', domain: 'amazon.com.au' }
    }
  };

  /* ============================================================
     STATE
     ============================================================ */
  let detectedRegion = 'us'; // default
  let currentTestimonialIndex = 0;
  let testimonialInterval = null;

  /* ============================================================
     UTILITY
     ============================================================ */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ============================================================
     REGION DETECTION
     ============================================================ */

  /**
   * Detect user's region via timezone or navigator.language.
   * No external API calls — privacy-friendly.
   */
  function detectRegion() {
    // Try timezone-based detection
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('America/Montreal') || tz.includes('Canada')) {
        return 'ca';
      }
      if (tz.startsWith('Europe/London') || tz.startsWith('Europe/Dublin')) {
        return 'uk';
      }
      if (tz.startsWith('Australia/') || tz.startsWith('Pacific/Auckland')) {
        return 'au';
      }
      if (tz.startsWith('America/')) {
        return 'us';
      }
    } catch (e) {
      // Fallback below
    }

    // Try language-based detection
    const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (lang.includes('en-gb')) return 'uk';
    if (lang.includes('en-au')) return 'au';
    if (lang.includes('en-ca') || lang.includes('fr-ca')) return 'ca';

    return 'us'; // default
  }

  /**
   * Show a region banner if user is not in US.
   */
  function showRegionBanner() {
    detectedRegion = detectRegion();

    if (detectedRegion === 'us') return; // No banner needed for US (default)

    const mkt = SP_CONFIG.marketplaces[detectedRegion];
    if (!mkt) return;

    const banner = document.createElement('div');
    banner.className = 'region-banner fade-in';
    banner.id = 'region-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <div class="container region-banner-inner">
        <span class="region-banner-text">
          ${mkt.flag} It looks like you're in <strong>${mkt.label.split('(')[1]?.replace(')', '') || ''}</strong> — 
          book links will open on <strong>${mkt.domain}</strong>
        </span>
        <button class="region-banner-close" aria-label="Dismiss region notice" id="region-banner-close">&times;</button>
      </div>
    `;

    // Insert after the nav
    const header = document.querySelector('header[role="banner"]');
    if (header) {
      header.insertAdjacentElement('afterend', banner);
    }

    // Close button
    document.getElementById('region-banner-close')?.addEventListener('click', () => {
      banner.remove();
    });

    // Store preference
    try {
      sessionStorage.setItem('bmx-region', detectedRegion);
    } catch (e) { /* ignore */ }
  }

  /* ============================================================
     TESTIMONIALS SECTION
     ============================================================ */

  function buildTestimonialsSection() {
    // Find insertion point: before the CTA banner
    const ctaBanner = document.querySelector('.cta-banner');
    if (!ctaBanner) return;

    const testimonials = SP_CONFIG.testimonials;
    if (!testimonials.length) return;

    const dotsHTML = testimonials.map((_, i) =>
      `<button class="testimonial-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Show testimonial ${i + 1}"></button>`
    ).join('');

    const cardsHTML = testimonials.map((t, i) => `
      <div class="testimonial-card${i === 0 ? ' active' : ''}" data-index="${i}" aria-hidden="${i !== 0}">
        <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <blockquote class="testimonial-text">"${esc(t.text)}"</blockquote>
        <div class="testimonial-meta">
          <span class="testimonial-author">${esc(t.author)}</span>
          <span class="testimonial-source">— ${esc(t.source)}</span>
        </div>
        <span class="testimonial-book">Re: ${esc(t.book)}</span>
      </div>
    `).join('');

    const sectionHTML = `
      <section class="testimonials-section section" id="testimonials" aria-labelledby="testimonials-heading">
        <div class="container">
          <header class="section-header fade-in">
            <span class="section-eyebrow">Reader Love</span>
            <h2 class="section-title" id="testimonials-heading">What Readers Are Saying</h2>
            <p class="section-subtitle">Real reviews from real readers on Amazon.</p>
          </header>

          <div class="testimonials-carousel" aria-live="polite" aria-atomic="true">
            <button class="testimonial-nav testimonial-nav--prev" aria-label="Previous testimonial" id="testimonial-prev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            <div class="testimonials-track">
              ${cardsHTML}
            </div>

            <button class="testimonial-nav testimonial-nav--next" aria-label="Next testimonial" id="testimonial-next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div class="testimonial-dots" aria-label="Testimonial navigation">
            ${dotsHTML}
          </div>
        </div>
      </section>
    `;

    ctaBanner.insertAdjacentHTML('beforebegin', sectionHTML);
    bindTestimonialEvents();
  }

  function showTestimonial(index) {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');

    if (!cards.length) return;

    // Wrap around
    if (index >= cards.length) index = 0;
    if (index < 0) index = cards.length - 1;

    currentTestimonialIndex = index;

    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
      card.setAttribute('aria-hidden', String(i !== index));
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function bindTestimonialEvents() {
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showTestimonial(currentTestimonialIndex - 1);
        resetAutoRotate();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showTestimonial(currentTestimonialIndex + 1);
        resetAutoRotate();
      });
    }

    // Dot navigation
    document.querySelectorAll('.testimonial-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        showTestimonial(parseInt(dot.dataset.index, 10));
        resetAutoRotate();
      });
    });

    // Auto-rotate every 6 seconds
    startAutoRotate();
  }

  function startAutoRotate() {
    testimonialInterval = setInterval(() => {
      showTestimonial(currentTestimonialIndex + 1);
    }, 6000);
  }

  function resetAutoRotate() {
    clearInterval(testimonialInterval);
    startAutoRotate();
  }

  /* ============================================================
     ANIMATED COUNTER (for hero stats)
     ============================================================ */

  function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const numMatch = text.match(/(\d[\d,]*)/);

          if (numMatch) {
            const target = parseInt(numMatch[1].replace(/,/g, ''), 10);
            animateNumber(el, target, text);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateNumber(el, target, template) {
    const duration = 1500;
    const start = performance.now();
    const suffix = template.replace(/[\d,]+/, '').trim();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = current.toLocaleString() + (suffix ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = template; // restore original with + sign etc.
      }
    }

    requestAnimationFrame(update);
  }

  /* ============================================================
     TOTAL SOLD COUNTER IN HERO
     ============================================================ */

  async function updateTotalSold() {
    try {
      const response = await fetch(SP_CONFIG.dataUrl, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) return;

      const data = await response.json();
      const books = data.books || [];
      const totalSold = books.reduce((sum, b) => sum + (b.sales_count || 0), 0);

      // Update hero stats — replace "Published Titles" with total sold if > 1000
      if (totalSold > 1000) {
        const stats = document.querySelectorAll('.hero-stat');
        // Add a total sold stat or update existing
        if (stats.length >= 1) {
          const firstStat = stats[0];
          const numEl = firstStat.querySelector('.hero-stat-number');
          const labelEl = firstStat.querySelector('.hero-stat-label');
          if (numEl && labelEl) {
            numEl.textContent = totalSold.toLocaleString() + '+';
            labelEl.textContent = 'Books Sold';
          }
        }
      }
    } catch (e) {
      // Silently fail — not critical
    }
  }

  /* ============================================================
     SOCIAL SHARE FUNCTIONALITY
     ============================================================ */

  /**
   * Add share button to featured cards.
   * Uses Web Share API where available, fallback to copy link.
   */
  function addShareButtons() {
    const featuredCards = document.querySelectorAll('.featured-card');
    if (!featuredCards.length) return;

    featuredCards.forEach(card => {
      const title = card.querySelector('.featured-card-title')?.textContent || '';
      const amazonLink = card.querySelector('.btn--amazon')?.href || '';

      if (!amazonLink) return;

      const shareBtn = document.createElement('button');
      shareBtn.className = 'share-btn';
      shareBtn.setAttribute('aria-label', `Share ${title}`);
      shareBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

      shareBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const shareData = {
          title: `${title} — BooksByMax Designs`,
          text: `Check out "${title}" on Amazon!`,
          url: amazonLink
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            if (err.name !== 'AbortError') {
              copyToClipboard(amazonLink, shareBtn);
            }
          }
        } else {
          copyToClipboard(amazonLink, shareBtn);
        }
      });

      // Insert share button in the card
      const badge = card.querySelector('.featured-card-badge');
      if (badge) {
        badge.appendChild(shareBtn);
      } else {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'featured-card-badge';
        badgeDiv.appendChild(shareBtn);
        card.prepend(badgeDiv);
      }
    });
  }

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.classList.add('share-btn--copied');
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('share-btn--copied');
      }, 2000);
    }).catch(() => {
      // Fallback: open in new tab
      window.open(text, '_blank');
    });
  }

  /* ============================================================
     MAIN INIT
     ============================================================ */
  function init() {
    // Region detection & banner
    showRegionBanner();

    // Testimonials section
    buildTestimonialsSection();

    // Update total sold in hero
    updateTotalSold();

    // Animated counters
    animateCounters();

    // Share buttons on featured cards (slight delay to ensure cards are rendered)
    setTimeout(addShareButtons, 500);

    console.info('[Social Proof] Phase 5 features initialized.');
  }

  /* ============================================================
     INIT — run after DOM is ready
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

})();
