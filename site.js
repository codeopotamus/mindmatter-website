/* Mind Matter site — navigation and motion.
 *
 * Everything here is progressive enhancement. With JS disabled the pages are
 * fully readable, every link is in the HTML, and nothing is hidden — the reveal
 * classes only take effect once this file confirms it can un-hide them.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── sticky nav border ────────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── mobile menu ──────────────────────────────────────────────────────
     Built from the desktop nav that is already in the HTML, so the two can
     never drift apart and crawlers still see one canonical set of links. */
  (function buildMenu() {
    var navIn = document.querySelector('.nav-in');
    var links = document.querySelector('.nav-links');
    if (!navIn || !links) return;

    var burger = document.createElement('button');
    burger.className = 'burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span>';
    navIn.appendChild(burger);

    var blurbs = {
      'features.html': 'Every tool, screener and insight',
      'bandura.html': 'The AI companion, and its limits',
      'therapy.html': 'Using this alongside real therapy',
      'check-in.html': 'Free PHQ-9, GAD-7 and full check-in',
      'privacy.html': 'How your data is handled',
      'terms.html': 'Terms of service',
      'safety.html': 'Health & safety disclaimer'
    };

    var sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Menu');

    var html = '<div class="sheet-in"><div class="sheet-top">' +
      '<a class="brand" href="index.html"><img src="logo.png" alt=""><span>Mind Matter</span></a>' +
      '</div><nav class="sheet-links">' +
      '<a href="index.html"><span class="lbl">Home<small>Overview and pricing</small></span></a>';

    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      var href = a.getAttribute('href');
      var cur = a.getAttribute('aria-current') ? ' aria-current="page"' : '';
      var note = blurbs[href] ? '<small>' + blurbs[href] + '</small>' : '';
      html += '<a href="' + href + '"' + cur + '><span class="lbl">' + a.textContent + note + '</span></a>';
    });

    html += '<div class="sheet-sep"></div>' +
      '<a href="privacy.html"><span class="lbl">Privacy Policy</span></a>' +
      '<a href="terms.html"><span class="lbl">Terms</span></a>' +
      '<a href="safety.html"><span class="lbl">Health &amp; Safety</span></a>' +
      '</nav><div class="sheet-foot">' +
      '<a class="btn btn-primary" href="index.html#get">Get the app</a>' +
      '<p>Mind Matter LLC · Arizona, USA</p>' +
      '</div></div>';

    sheet.innerHTML = html;
    document.body.appendChild(sheet);

    var open = false;
    function setOpen(next) {
      open = next;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
      if (open) {
        sheet.classList.add('mounted');
        // let display:block land before transitioning opacity/transform
        requestAnimationFrame(function () { sheet.classList.add('open'); });
        document.body.style.overflow = 'hidden';
      } else {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () { if (!open) sheet.classList.remove('mounted'); }, 340);
      }
    }

    burger.addEventListener('click', function () { setOpen(!open); });
    sheet.addEventListener('click', function (e) {
      // backdrop click, or any link tap, closes it
      if (e.target === sheet || e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (open && window.innerWidth > 860) setOpen(false);
    });
  })();

  /* ── count-up numbers ─────────────────────────────────────────────── */
  function countUp(el) {
    if (el.dataset.counting === '1') return;     // never run twice on one element
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (reduce) { el.textContent = String(target); return; }

    el.dataset.counting = '1';
    var dur = 1100, t0 = null, done = false;

    function settle() {
      if (done) return;
      done = true;
      el.textContent = String(target);
    }

    function tick(ts) {
      if (done) return;
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      // easeOutExpo
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(target * e));
      if (p < 1) requestAnimationFrame(tick);
      else settle();
    }
    requestAnimationFrame(tick);

    /* rAF is paused in background tabs, which would strand the number partway
       (e.g. showing 16 when it should read 18). Timers keep running, so use one
       as a guarantee that the final value always lands. */
    setTimeout(settle, dur + 250);
  }

  /* Any .stat .n holding a bare integer becomes a counter. Only blank it out if
     it actually sits inside something that will be revealed — otherwise nothing
     would ever trigger the count and the number would read 0 forever. */
  Array.prototype.forEach.call(document.querySelectorAll('.stat .n'), function (el) {
    var txt = el.textContent.trim();
    if (!/^\d+$/.test(txt)) return;
    el.setAttribute('data-count', txt);
    var willAnimate = !reduce &&
      'IntersectionObserver' in window &&
      el.closest('.rv, .rv-l, .rv-r, .rv-s');
    if (willAnimate) el.textContent = '0';
  });

  /* ── reveals ──────────────────────────────────────────────────────── */
  var items = document.querySelectorAll('.rv, .rv-l, .rv-r, .rv-s');

  /* Counters can sit anywhere inside a revealed element — the reveal class is
     often on the grid container rather than each tile — so search descendants
     as well as the element itself. Missing this leaves the numbers at 0. */
  function runCounters(el) {
    if (el.matches('[data-count]')) countUp(el);
    Array.prototype.forEach.call(el.querySelectorAll('[data-count]'), countUp);
  }

  function revealAll() {
    Array.prototype.forEach.call(items, function (el) {
      el.classList.add('in');
      runCounters(el);
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        runCounters(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(items, function (el, i) {
      // stagger within a row, but never delay so long it feels broken
      el.style.transitionDelay = Math.min(i % 6, 4) * 55 + 'ms';
      io.observe(el);
    });

    /* Safety net. A stat blanked to "0" while waiting to animate is not a
       missing flourish — it reads as "0 validated screening questionnaires".
       If anything stops the observer firing (background tab, an odd browser,
       a throttled renderer), force every counter to its real value rather than
       leave false numbers on the page. */
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
        if (el.dataset.counting !== '1') el.textContent = el.getAttribute('data-count');
      });
    }, 4000);
  }

  /* ── parallax ─────────────────────────────────────────────────────── */
  var pars = document.querySelectorAll('.par');
  if (pars.length && !reduce) {
    var ticking = false;
    function frame() {
      var vh = window.innerHeight;
      Array.prototype.forEach.call(pars, function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var depth = parseFloat(el.getAttribute('data-depth')) || 0.06;
        // 0 when the element is centred, ± as it travels through the viewport
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * depth).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }
})();
