/**
 * BooksByMax Designs — Main JavaScript
 * Phase 1: Foundation & Brand Identity
 *
 * Vanilla JS only — no frameworks, GitHub Pages compatible.
 */

(function () {
  'use strict';

  /* ============================================================
     1. STICKY NAV — add shadow on scroll
     ============================================================ */
  const nav = document.getElementById('site-nav');

  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  /* ============================================================
     2. MOBILE HAMBURGER MENU
     ============================================================ */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });

    // Close when clicking outside the menu
    document.addEventListener('click', (e) => {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }


  /* ============================================================
     3. SCROLL ANIMATIONS — fade-in on viewport entry
     ============================================================ */
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements immediately if IntersectionObserver not supported
    fadeElements.forEach(el => el.classList.add('visible'));
  }


  /* ============================================================
     4. SMOOTH SCROLL for anchor links (polyfill for older browsers)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        // Update URL hash without jumping
        history.pushState(null, '', targetId);

        // Move focus to target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });


  /* ============================================================
     5. ACTIVE NAV LINK — highlight current section
     ============================================================ */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length > 0 && sections.length > 0) {
    const navHeight = nav ? nav.offsetHeight : 70;

    const highlightNav = () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 40;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
  }


  /* ============================================================
     6. FOOTER YEAR — auto-update copyright year
     ============================================================ */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ============================================================
     7. EMAIL SIGNUP FORM — basic UX feedback
     ============================================================ */
  const ctaForm = document.querySelector('.cta-form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = ctaForm.querySelector('input[type="email"]');
      const btn = ctaForm.querySelector('button[type="submit"]');

      if (input && input.value) {
        // Placeholder: replace with actual email service integration in Phase 5
        const originalText = btn.textContent;
        btn.textContent = 'Thanks! ✓';
        btn.disabled = true;
        btn.style.background = '#14b8a6';
        input.value = '';
        input.placeholder = 'You\'re on the list!';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
          input.placeholder = 'Enter your email address';
        }, 4000);
      }
    });
  }

})();
