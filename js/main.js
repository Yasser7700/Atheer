/* ============================================================
   ATHEER — أثير
   Main JavaScript: Interactions, Animations, Simulations
   ============================================================ */

'use strict';

/* ── Utility ── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const on  = (el, ev, fn) => el && el.addEventListener(ev, fn, { passive: true });

/* ──────────────────────────────────────────────
   1. NAVBAR — scroll state + mobile menu
   ────────────────────────────────────────────── */
(function initNavbar() {
  const nav      = qs('#navbar');
  const burger   = qs('.nav-hamburger');
  const mobileMenu = qs('.nav-mobile-menu');
  const closeBtn = qs('.nav-mobile-close');
  const mobileLinks = qsa('.nav-mobile-menu a');

  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 20);
        lastScroll = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mobile menu
  const openMenu  = () => mobileMenu && mobileMenu.classList.add('open');
  const closeMenu = () => mobileMenu && mobileMenu.classList.remove('open');

  on(burger, 'click', openMenu);
  on(closeBtn, 'click', closeMenu);
  mobileLinks.forEach(a => on(a, 'click', closeMenu));

  // Highlight active nav link on scroll
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ──────────────────────────────────────────────
   2. SCROLL REVEAL
   ────────────────────────────────────────────── */
(function initScrollReveal() {
  const revealClasses = ['.reveal', '.reveal-scale', '.reveal-left', '.reveal-right'];
  const allReveal = qsa(revealClasses.join(','));

  if (!allReveal.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  allReveal.forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────────
   3. SMOOTH SCROLL for nav links
   ────────────────────────────────────────────── */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = qs(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ──────────────────────────────────────────────
   4. ANIMATED COUNTERS
   ────────────────────────────────────────────── */
(function initCounters() {
  const counters = qsa('[data-counter]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target   = parseFloat(el.dataset.counter);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration || 1800);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = target * easeOut(progress);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();


/* ──────────────────────────────────────────────
   5. HOW IT WORKS — Token Flow Animation
   ────────────────────────────────────────────── */
(function initTokenFlow() {
  const nodes      = qsa('.token-node');
  const connectors = qsa('.token-connector');
  let  step        = 0;
  let  interval    = null;
  let  started     = false;

  if (!nodes.length) return;

  const advance = () => {
    nodes.forEach((n, i) => {
      n.classList.toggle('lit', i <= step);
    });
    connectors.forEach((c, i) => {
      c.classList.toggle('lit', i < step);
    });
    step = (step + 1) % (nodes.length + 1);
    if (step === 0) {
      // brief pause at full
      clearInterval(interval);
      setTimeout(() => {
        nodes.forEach(n => n.classList.remove('lit'));
        connectors.forEach(c => c.classList.remove('lit'));
        step = 0;
        interval = setInterval(advance, 600);
      }, 1200);
    }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        interval = setInterval(advance, 600);
      }
    });
  }, { threshold: 0.3 });

  const tokenFlow = qs('.token-flow');
  if (tokenFlow) io.observe(tokenFlow);
})();


/* ──────────────────────────────────────────────
   6. DATA FLOW VIZ (Shift Section)
   ────────────────────────────────────────────── */
(function initFlowViz() {
  const nodes = qsa('.flow-node');
  let step    = 0;
  let started = false;

  if (!nodes.length) return;

  const advance = () => {
    nodes.forEach((n, i) => n.classList.toggle('active', i === step));
    step = (step + 1) % nodes.length;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        advance();
        setInterval(advance, 800);
      }
    });
  }, { threshold: 0.3 });

  const viz = qs('.data-flow-viz');
  if (viz) io.observe(viz);
})();


/* ──────────────────────────────────────────────
   7. PAYMENT SIMULATION
   ────────────────────────────────────────────── */
(function initPaymentDemo() {
  const btn        = qs('#demo-pay-btn');
  const logEl      = qs('#demo-log');
  const customerPhone = qs('.demo-phone.customer-side');
  const merchantPhone = qs('.demo-phone.merchant-side');
  const nfcWaves   = qsa('.demo-wave');
  const entries    = qsa('.log-entry');
  const successBanner = qs('#demo-success');

  if (!btn) return;

  let running = false;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const showEntry = async (index) => {
    if (!entries[index]) return;
    entries[index].classList.add('visible');
    await sleep(50);
  };

  const hideAllEntries = () => {
    entries.forEach(e => e.classList.remove('visible'));
  };

  const setPhoneState = (phone, state) => {
    if (!phone) return;
    const textEl = phone.querySelector('.demo-status-text');
    const iconEl = phone.querySelector('.demo-status-icon');

    if (state === 'idle') {
      if (iconEl) iconEl.textContent = '💳';
      if (textEl) textEl.textContent = 'جاهز للدفع';
      phone.classList.remove('active');
    } else if (state === 'auth') {
      if (iconEl) iconEl.textContent = '🔐';
      if (textEl) textEl.textContent = 'التحقق بالبصمة...';
      phone.classList.add('active');
    } else if (state === 'signing') {
      if (iconEl) iconEl.textContent = '✍️';
      if (textEl) textEl.textContent = 'توقيع محلي...';
    } else if (state === 'signed') {
      if (iconEl) iconEl.textContent = '✅';
      if (textEl) textEl.textContent = 'تم التوقيع ✓';
    } else if (state === 'nfc') {
      if (iconEl) iconEl.textContent = '📶';
      if (textEl) textEl.textContent = 'NFC...';
    } else if (state === 'success') {
      if (iconEl) iconEl.textContent = '✅';
      if (textEl) textEl.textContent = 'تم الاستلام ✓';
      phone.classList.add('active');
    } else if (state === 'verifying') {
      if (iconEl) iconEl.textContent = '🔍';
      if (textEl) textEl.textContent = 'جارٍ التحقق...';
    }
  };

  const triggerNFC = () => {
    nfcWaves.forEach(w => {
      w.classList.remove('animate');
      // Force reflow
      void w.offsetWidth;
      w.classList.add('animate');
    });
  };

  const runSimulation = async () => {
    if (running) return;
    running = true;
    btn.disabled = true;
    btn.textContent = '...';
    hideAllEntries();
    if (successBanner) successBanner.style.display = 'none';

    // Reset phones
    setPhoneState(customerPhone, 'idle');
    setPhoneState(merchantPhone, 'idle');

    await sleep(400);

    // Step 1 - Auth
    setPhoneState(customerPhone, 'auth');
    await showEntry(0);
    await sleep(1400);

    // Step 2 - Signing
    setPhoneState(customerPhone, 'signing');
    await showEntry(1);
    await sleep(1200);

    // Step 3 - Signed
    setPhoneState(customerPhone, 'signed');
    await showEntry(2);
    await sleep(800);

    // Step 4 - NFC transfer
    setPhoneState(customerPhone, 'nfc');
    setPhoneState(merchantPhone, 'nfc');
    triggerNFC();
    await showEntry(3);
    await sleep(1800);

    // Step 5 - Verifying
    setPhoneState(merchantPhone, 'verifying');
    await showEntry(4);
    await sleep(1400);

    // Step 6 - Verified
    await showEntry(5);
    await sleep(600);

    // Step 7 - Success
    setPhoneState(customerPhone, 'success');
    setPhoneState(merchantPhone, 'success');
    await showEntry(6);
    await sleep(400);

    if (successBanner) {
      successBanner.style.display = 'flex';
      successBanner.style.animation = 'none';
      void successBanner.offsetWidth;
      successBanner.style.animation = '';
    }

    btn.textContent = 'إعادة المحاكاة';
    btn.disabled = false;
    running = false;
  };

  btn.addEventListener('click', runSimulation);
})();


/* ──────────────────────────────────────────────
   8. ECOSYSTEM — hover reveals
   ────────────────────────────────────────────── */
(function initEcosystem() {
  const nodes = qsa('.eco-node');
  nodes.forEach(node => {
    on(node, 'mouseenter', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
    });
  });
})();


/* ──────────────────────────────────────────────
   9. HERO NFC — phone glow on wave pass
   ────────────────────────────────────────────── */
(function initHeroPhones() {
  const phones = qsa('.nfc-phone');
  if (!phones.length) return;

  // Wave interval synced glow
  const rings = qsa('.nfc-wave-ring');
  let offset = 0;

  setInterval(() => {
    phones.forEach(p => {
      p.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 50px rgba(0,200,232,0.30)';
      setTimeout(() => {
        p.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(27,43,138,0.25)';
      }, 400);
    });
  }, 2400);
})();


/* ──────────────────────────────────────────────
   10. MAGNETIC BUTTON EFFECT
   ────────────────────────────────────────────── */
(function initMagnetic() {
  const btns = qsa('.btn-primary, .btn-secondary');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      const strength = 0.18;
      btn.style.transform = `translate(${x * strength}px, ${y * strength - 2}px)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    }, { passive: true });
  });
})();


/* ──────────────────────────────────────────────
   11. HOW-STEPS — animated step highlights
   ────────────────────────────────────────────── */
(function initHowSteps() {
  const steps = qsa('.step-card');
  if (!steps.length) return;

  let current = 0;
  let started = false;

  const highlight = () => {
    steps.forEach((s, i) => {
      const wrap = s.querySelector('.step-num-wrap');
      if (!wrap) return;
      if (i === current) {
        wrap.style.borderColor = 'var(--accent)';
        wrap.style.boxShadow   = '0 0 30px rgba(0,200,160,0.3)';
      } else {
        wrap.style.borderColor = '';
        wrap.style.boxShadow   = '';
      }
    });
    current = (current + 1) % steps.length;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        setInterval(highlight, 1000);
      }
    });
  }, { threshold: 0.3 });

  const section = qs('#how');
  if (section) io.observe(section);
})();


/* ──────────────────────────────────────────────
   12. PROBLEM CARDS — staggered entrance
   ────────────────────────────────────────────── */
(function initProblemCards() {
  const cards = qsa('.problem-card');
  if (!cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
    io.observe(card);
  });
})();


/* ──────────────────────────────────────────────
   13. SECTION BACKGROUND PARALLAX (subtle)
   ────────────────────────────────────────────── */
(function initParallax() {
  const heroBg = qs('.hero-bg');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
})();


/* ──────────────────────────────────────────────
   14. SECURITY VIZ — rotate dots
   ────────────────────────────────────────────── */
(function initSecurityViz() {
  const viz = qs('.security-viz');
  if (!viz) return;

  let angle = 0;
  let animating = false;
  let started   = false;

  const dots = qsa('.security-layer-dot', viz);

  const rotateDots = () => {
    angle += 0.15;
    dots.forEach((dot, i) => {
      const baseAngle = (i / dots.length) * 360 + angle;
      const rad = (baseAngle * Math.PI) / 180;
      const radii = [60, 90, 120, 150, 120, 90, 60];
      const r = radii[i] || 80;
      const x = Math.cos(rad) * r;
      const y = Math.sin(rad) * r;
      dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
    if (animating) requestAnimationFrame(rotateDots);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started   = true;
        animating = true;
        requestAnimationFrame(rotateDots);
      }
    });
  }, { threshold: 0.3 });

  io.observe(viz);
})();


/* ──────────────────────────────────────────────
   15. YEAR + INIT
   ────────────────────────────────────────────── */
(function setYear() {
  const y = qs('#copyright-year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ──────────────────────────────────────────────
   16. CARD TILT EFFECT
   ────────────────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tiltCards = qsa('.feature-card, .eco-node, .value-col');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 4;
      const rotY   =  dx * 4;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    }, { passive: true });
  });
})();
