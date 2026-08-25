/**
 * Ben's Cycle Fitness Center — main.js
 *
 * Modules:
 *  1. Motion gate (prefers-reduced-motion)
 *  2. SVG spoke generator
 *  3. Nav scroll shadow + mobile menu
 *  4. Hero scroll-driven animation (wheel + parallax)
 *  5. Trust section mechanic-photo parallax
 *  6. Reveal-once IntersectionObserver
 *  7. Repair-ticket card deck (drag / pointer-capture / keyboard)
 *  8. Hours table — highlight today + open/closed badge
 *  9. Contact form — validation + stub fetch submission
 * 10. Footer year
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. Motion Gate
   ═══════════════════════════════════════════════════════════ */
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Add .motion class to body only when animation is safe to use.
// All CSS animations/transitions are scoped to .motion so the page
// renders fully legible without JS or with reduced-motion enabled.
if (!prefersReducedMotion) {
  document.body.classList.add('motion');
}


/* ═══════════════════════════════════════════════════════════
   2. SVG Spoke Generator
   ═══════════════════════════════════════════════════════════ */
(function generateSpokes() {
  const group = document.getElementById('wheel-group');
  if (!group) return;

  const cx = 200, cy = 200;
  const hubR = 24;
  const rimR = 173;
  const count = 32;
  const ns = 'http://www.w3.org/2000/svg';

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * hubR;
    const y1 = cy + Math.sin(angle) * hubR;
    const x2 = cx + Math.cos(angle) * rimR;
    const y2 = cy + Math.sin(angle) * rimR;

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x1.toFixed(3));
    line.setAttribute('y1', y1.toFixed(3));
    line.setAttribute('x2', x2.toFixed(3));
    line.setAttribute('y2', y2.toFixed(3));
    line.setAttribute('stroke', 'rgba(247,245,241,0.32)');
    line.setAttribute('stroke-width', '1.3');
    line.setAttribute('stroke-linecap', 'round');
    group.appendChild(line);
  }
})();


/* ═══════════════════════════════════════════════════════════
   3. Nav — scroll shadow + mobile menu
   ═══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('main-nav');
  const toggle = nav ? nav.querySelector('.nav-toggle') : null;
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll shadow
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });

    // Close on link click inside mobile menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
        toggle.focus();
      }
    });
  }
})();


/* ═══════════════════════════════════════════════════════════
   4. Hero — scroll-driven wheel + photo parallax
   Bound to scroll. 1:1 responsive with zero dead zone.
   Reverses cleanly on scroll-up.
   ═══════════════════════════════════════════════════════════ */
(function initHeroScroll() {
  if (prefersReducedMotion) return;

  const hero        = document.getElementById('hero');
  const wheelWrap   = document.querySelector('.spoke-wheel-container');
  const heroContent = document.querySelector('.hero-content');
  const heroPhoto   = document.querySelector('.hero-photo');

  if (!hero || !wheelWrap) return;

  let ticking = false;

  function update() {
    const heroH     = hero.offsetHeight;
    const viewH     = window.innerHeight;
    const maxScroll = heroH - viewH;
    if (maxScroll <= 0) {
      ticking = false;
      return;
    }

    const scrollY  = window.scrollY;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    // Wheel: smoothly rotates forward with scroll progress, eases to rest, reverses cleanly on scroll-up
    const wheelRotation = progress * 160;
    const wheelOpacity  = Math.max(0.85 - progress * 0.45, 0.15);
    wheelWrap.style.transform = `rotate(${wheelRotation}deg)`;
    wheelWrap.style.opacity   = wheelOpacity;

    // Headline: drifts slightly and fades smoothly as hero exits
    if (heroContent) {
      const yShift  = progress * -35;
      const opacity = Math.max(1 - progress * 1.3, 0);
      heroContent.style.transform = `translateY(${yShift}px)`;
      heroContent.style.opacity   = opacity;
    }

    // Photo: subtle parallax
    if (heroPhoto) {
      const yParallax = progress * 6;
      heroPhoto.style.transform = `scale(1.08) translateY(${yParallax}%)`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();


/* ═══════════════════════════════════════════════════════════
   5. Trust Section — mechanic photo gentle parallax on scroll
   ═══════════════════════════════════════════════════════════ */
(function initMechanicParallax() {
  if (prefersReducedMotion) return;

  const mechanicWrap = document.querySelector('.mechanic-circle-wrap');
  const trust = document.getElementById('trust');
  if (!mechanicWrap || !trust) return;

  function update() {
    const rect = trust.getBoundingClientRect();
    const viewH = window.innerHeight;
    // progress 0 when top of section at bottom of view → 1 when bottom of section at top
    const raw = 1 - (rect.bottom / (rect.height + viewH));
    const progress = Math.min(Math.max(raw, 0), 1);
    const yDrift = (progress - 0.5) * 40; // ±20px drift
    mechanicWrap.style.transform = `translateX(15%) translateY(${yDrift}px)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ═══════════════════════════════════════════════════════════
   6. Reveal-once IntersectionObserver
   Fires once per element — does NOT un-reveal on scroll-up.
   ═══════════════════════════════════════════════════════════ */
(function initRevealObserver() {
  if (prefersReducedMotion) {
    // Show everything immediately; no animation needed
    document.querySelectorAll('.reveal-once').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target); // fire once only
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -48px 0px',
  });

  document.querySelectorAll('.reveal-once').forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════
   7. Repair-Ticket Card Deck
   ═══════════════════════════════════════════════════════════ */
(function initTicketDeck() {
  const deck    = document.getElementById('ticket-deck');
  const inner   = document.getElementById('deck-cards-inner');
  const prevBtn = document.getElementById('deck-prev');
  const nextBtn = document.getElementById('deck-next');

  if (!deck || !inner) return;

  // Collect cards and maintain a logical order array
  let cards = Array.from(inner.querySelectorAll('.ticket-card'));
  const TOTAL = cards.length;
  let currentIndex = 0; // index of the top card

  // Stack layout offsets: [top card → cards behind it]
  const STACK_OFFSETS = [
    { x:  0,   y:  0,  rotate:  0,    scale: 1.00, zIndex: TOTAL },
    { x:  8,   y:  5,  rotate:  1.4,  scale: 0.975, zIndex: TOTAL - 1 },
    { x: -5,   y: 10,  rotate: -1.0,  scale: 0.950, zIndex: TOTAL - 2 },
    { x: 12,   y: 14,  rotate:  2.0,  scale: 0.925, zIndex: TOTAL - 3 },
    { x: -3,   y: 18,  rotate: -0.5,  scale: 0.900, zIndex: TOTAL - 4 },
    { x:  6,   y: 22,  rotate:  1.2,  scale: 0.878, zIndex: TOTAL - 5 },
  ];

  // Apply stacking CSS transforms to all cards based on current order
  function applyStackLayout(animated = true) {
    const orderedCards = getOrderedCards();
    orderedCards.forEach((card, stackPos) => {
      const off = STACK_OFFSETS[stackPos] || STACK_OFFSETS[STACK_OFFSETS.length - 1];
      const t = `translate(${off.x}px, ${off.y}px) rotate(${off.rotate}deg) scale(${off.scale})`;

      if (animated) {
        card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.3s ease, box-shadow 0.2s ease';
      } else {
        card.style.transition = 'none';
      }
      card.style.transform = t;
      card.style.zIndex    = String(off.zIndex);
      card.style.opacity   = '1';
    });

    // Update dots on top card
    updateDots(currentIndex);
  }

  // Returns cards reordered so the current top card is first
  function getOrderedCards() {
    const result = [];
    for (let i = 0; i < TOTAL; i++) {
      result.push(cards[(currentIndex + i) % TOTAL]);
    }
    return result;
  }

  // Update progress dots on the currently visible top card
  function updateDots(cardDataIndex) {
    cards.forEach((card, idx) => {
      const dots = card.querySelectorAll('.dot');
      dots.forEach((dot, di) => {
        dot.classList.toggle('active', di === idx);
      });
    });
  }

  // Initialize layout without animation
  applyStackLayout(false);

  // ─── Advance or retreat the deck ─────────────────────────
  function advance(direction) {
    const topCard = getOrderedCards()[0];

    // Remove transition so we can set throw position instantly then animate
    topCard.style.transition = 'none';

    // Throw the top card off screen
    void topCard.offsetWidth; // force reflow
    topCard.classList.add(direction === 1 ? 'throwing-right' : 'throwing-left');

    // After throw animation, update order and re-layout
    setTimeout(() => {
      topCard.classList.remove('throwing-left', 'throwing-right');
      topCard.style.transition = 'none';
      // Move to the logical back of the order
      if (direction === 1) {
        currentIndex = (currentIndex + 1) % TOTAL;
      } else {
        currentIndex = (currentIndex - 1 + TOTAL) % TOTAL;
      }
      applyStackLayout(false);
      // Small delay then re-enable transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyStackLayout(true);
        });
      });
    }, 380);
  }

  // Button controls
  nextBtn && nextBtn.addEventListener('click', () => advance(1));
  prevBtn && prevBtn.addEventListener('click', () => advance(-1));

  // ─── Keyboard support ────────────────────────────────────
  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      advance(1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      advance(-1);
    }
  });

  // ─── Pointer (drag) support ──────────────────────────────
  let dragging = false;
  let startX = 0;
  let currentX = 0;
  let activeCard = null;

  const THROW_THRESHOLD = inner.offsetWidth * 0.1; // 10% of deck width

  function onPointerDown(e) {
    // Only respond to primary pointer on the top card
    const topCard = getOrderedCards()[0];
    if (!topCard.contains(e.target) && e.target !== topCard) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragging  = true;
    startX    = e.clientX;
    currentX  = e.clientX;
    activeCard = topCard;

    activeCard.setPointerCapture(e.pointerId);
    activeCard.style.transition = 'none'; // disable transition during drag
    activeCard.style.cursor = 'grabbing';
  }

  function onPointerMove(e) {
    if (!dragging || !activeCard) return;
    currentX = e.clientX;
    const dx = currentX - startX;
    const rotate = dx * 0.04; // subtle rotation proportional to drag distance
    const base = STACK_OFFSETS[0];
    activeCard.style.transform = `translate(${dx}px, ${base.y}px) rotate(${rotate}deg) scale(${base.scale})`;
  }

  function onPointerUp(e) {
    if (!dragging || !activeCard) return;
    dragging = false;

    const dx = currentX - startX;
    const threshold = Math.max(inner.offsetWidth * 0.1, 40);

    activeCard.style.cursor = '';

    if (Math.abs(dx) >= threshold) {
      advance(dx > 0 ? 1 : -1);
    } else {
      // Snap back to top position
      activeCard.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)';
      const off = STACK_OFFSETS[0];
      activeCard.style.transform = `translate(${off.x}px, ${off.y}px) rotate(${off.rotate}deg) scale(${off.scale})`;
    }

    activeCard = null;
  }

  inner.addEventListener('pointerdown', onPointerDown);
  inner.addEventListener('pointermove', onPointerMove);
  inner.addEventListener('pointerup',   onPointerUp);
  inner.addEventListener('pointercancel', onPointerUp);
})();


/* ═══════════════════════════════════════════════════════════
   8. Hours Table — highlight today + open/closed badge
   ═══════════════════════════════════════════════════════════ */
(function initHoursTable() {
  // Hours in Milwaukee local time (CDT = UTC-5)
  // We compute whether the shop is currently open using browser's local time.
  // NOTE: On deployment, consider passing TZ-correct data from the server.
  const now       = new Date();
  const dayOfWeek = now.getDay();     // 0=Sun, 1=Mon … 6=Sat
  const hours     = now.getHours();   // local hours

  // Shop schedule
  const schedule = {
    0: { open: 10, close: 14 }, // Sun 10-2
    1: { open: 10, close: 18 }, // Mon-Fri 10-6
    2: { open: 10, close: 18 },
    3: { open: 10, close: 18 },
    4: { open: 10, close: 18 },
    5: { open: 10, close: 18 },
    6: { open: 9,  close: 16 }, // Sat 9-4
  };

  const todaySchedule = schedule[dayOfWeek];
  const isOpen = todaySchedule
    ? hours >= todaySchedule.open && hours < todaySchedule.close
    : false;

  const rows = document.querySelectorAll('.hours-table tbody tr[data-day]');
  rows.forEach(row => {
    const rowDay = parseInt(row.dataset.day, 10);
    const badge  = row.querySelector('.status-badge');
    if (!badge) return;

    if (rowDay === dayOfWeek) {
      row.classList.add('today');
      if (isOpen) {
        badge.textContent = 'Open Now';
        badge.classList.add('open');
      } else {
        badge.textContent = 'Closed';
        badge.classList.add('closed');
      }
    } else {
      badge.textContent = '—';
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
   9. Contact Form — validation + stub fetch
   DEPLOYMENT: Replace the fetch target '/api/contact' with
   your real backend endpoint before going live.
   ═══════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit-btn');
  const successEl  = document.getElementById('form-success');
  const errorEl    = document.getElementById('form-error');

  if (!form) return;

  // Email regex — RFC 5322 simplified
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone regex — permissive (allows dashes, dots, parens, spaces, +)
  const PHONE_RE = /^[+\d\s\-().]{7,20}$/;

  function setErr(fieldId, message) {
    const errEl = document.getElementById(fieldId + '-err');
    const input = document.getElementById(fieldId);
    if (!errEl || !input) return;
    errEl.textContent = message;
    if (message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
    }
  }

  function clearAllErrors() {
    ['f-name', 'f-email', 'f-phone', 'f-message'].forEach(id => setErr(id, ''));
  }

  function validate() {
    let valid = true;
    clearAllErrors();

    const name    = form['name'].value.trim();
    const email   = form['email'].value.trim();
    const phone   = form['phone'].value.trim();
    const message = form['message'].value.trim();

    if (!name) {
      setErr('f-name', 'Please enter your name.');
      valid = false;
    }
    if (!email) {
      setErr('f-email', 'Please enter your email address.');
      valid = false;
    } else if (!EMAIL_RE.test(email)) {
      setErr('f-email', 'Please enter a valid email address.');
      valid = false;
    }
    if (phone && !PHONE_RE.test(phone)) {
      setErr('f-phone', 'Please enter a valid phone number.');
      valid = false;
    }
    if (!message) {
      setErr('f-message', 'Please enter a message.');
      valid = false;
    }

    return valid;
  }

  // Real-time validation on blur
  ['f-name', 'f-email', 'f-phone', 'f-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validate());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous feedback
    successEl.hidden = true;
    errorEl.hidden   = true;

    if (!validate()) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = {
      name:    form['name'].value.trim(),
      email:   form['email'].value.trim(),
      phone:   form['phone'].value.trim(),
      service: form['service'].value,
      message: form['message'].value.trim(),
    };

    try {
      /**
       * STUB — replace '/api/contact' with your real backend endpoint.
       * Expected response: HTTP 200 with JSON { ok: true } on success.
       * The catch block handles network errors; non-200 responses throw
       * via the response.ok check below.
       */
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Success state
      form.reset();
      clearAllErrors();
      successEl.hidden = false;
      successEl.focus();
    } catch (err) {
      // Show error regardless of whether it's network, endpoint, or server error
      // (In production the stub will 404; this will show the error state.)
      errorEl.hidden = false;
      errorEl.focus();
      console.warn('[contact-form] submission error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
})();


/* ═══════════════════════════════════════════════════════════
  10. Footer year
   ═══════════════════════════════════════════════════════════ */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();
