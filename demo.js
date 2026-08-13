/* The interactive mini-app on the home page.
 *
 * Illustrative sample data — this is a demo of the interface, not anyone's real
 * record, and it is labelled as such on the page. Screens are re-rendered on
 * switch so the CSS entrance animations replay every time.
 */
(function () {
  'use strict';

  var stage = document.getElementById('demoScreen');
  var seg = document.getElementById('demoSeg');
  if (!stage || !seg) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 14 days of mood, 1–5, drifting upward with realistic noise */
  var MOOD = [2.4, 2.0, 2.9, 2.2, 1.8, 2.7, 3.0, 2.6, 3.4, 3.1, 3.9, 3.5, 4.1, 4.2];

  function chartSVG() {
    var W = 268, H = 104, pad = 6;
    var n = MOOD.length;
    var x = function (i) { return pad + (i / (n - 1)) * (W - pad * 2); };
    var y = function (v) { return H - pad - ((v - 1) / 4) * (H - pad * 2); };

    // Catmull-Rom-ish smoothing: a light quadratic through midpoints reads as a
    // hand-drawn trend line rather than a jagged polyline.
    var d = 'M' + x(0).toFixed(1) + ',' + y(MOOD[0]).toFixed(1);
    for (var i = 0; i < n - 1; i++) {
      var mx = (x(i) + x(i + 1)) / 2, my = (y(MOOD[i]) + y(MOOD[i + 1])) / 2;
      d += ' Q' + x(i).toFixed(1) + ',' + y(MOOD[i]).toFixed(1) + ' ' + mx.toFixed(1) + ',' + my.toFixed(1);
    }
    d += ' T' + x(n - 1).toFixed(1) + ',' + y(MOOD[n - 1]).toFixed(1);

    var area = d + ' L' + x(n - 1).toFixed(1) + ',' + (H - pad) + ' L' + x(0).toFixed(1) + ',' + (H - pad) + ' Z';
    var len = Math.round(W * 1.9); // generous over-estimate for the dash animation

    return '' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#5b9dff"/><stop offset="60%" stop-color="#93c2ff"/>' +
            '<stop offset="100%" stop-color="#f0c98c"/>' +
          '</linearGradient>' +
          '<linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#5b9dff" stop-opacity=".34"/>' +
            '<stop offset="100%" stop-color="#5b9dff" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<path class="m-area" d="' + area + '"/>' +
        '<path class="m-path" style="--len:' + len + '" d="' + d + '"/>' +
        '<circle class="m-dot" cx="' + x(n - 1).toFixed(1) + '" cy="' + y(MOOD[n - 1]).toFixed(1) + '" r="4.5" fill="#f0c98c"/>' +
        '<circle class="m-dot" cx="' + x(n - 1).toFixed(1) + '" cy="' + y(MOOD[n - 1]).toFixed(1) + '" r="9" fill="#f0c98c" opacity=".18"/>' +
      '</svg>';
  }

  function heatGrid() {
    var cells = '';
    for (var i = 0; i < 42; i++) {
      // deterministic pseudo-pattern: denser toward the recent end
      var recency = i / 42;
      var seeded = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      var on = Math.abs(seeded) < 0.3 + recency * 0.5;
      var alpha = on ? (0.22 + Math.abs(seeded) * 0.55).toFixed(2) : '0.05';
      var bg = on ? 'rgba(91,157,255,' + alpha + ')' : 'rgba(255,255,255,.05)';
      cells += '<i style="background:' + bg + ';animation-delay:' + (i * 11) + 'ms"></i>';
    }
    return '<div class="m-heat">' + cells + '</div>';
  }

  var SCREENS = [
    {
      id: 'today',
      label: 'Today',
      copyTitle: 'It starts with one tap.',
      copyText: 'Rate the day and you are done — that is the whole obligation. The streak and the ring exist to reward turning up, not to make you perform wellness.',
      render: function () {
        return '' +
          '<div class="scr-s">Wednesday, 12 August</div>' +
          '<div class="scr-h">How are you today?</div>' +
          '<div class="ring-wrap" style="margin-top:16px">' +
            '<div class="ring">' +
              '<svg width="78" height="78" viewBox="0 0 78 78">' +
                '<circle cx="39" cy="39" r="33" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="7"/>' +
                '<circle cx="39" cy="39" r="33" fill="none" stroke="#5b9dff" stroke-width="7" stroke-linecap="round"' +
                  ' stroke-dasharray="207" stroke-dashoffset="62"/>' +
              '</svg>' +
              '<div class="lab">4</div>' +
            '</div>' +
            '<div class="ring-txt">' +
              '<div class="t">Pretty good</div>' +
              '<div class="d">Best you have logged in nine days.</div>' +
            '</div>' +
          '</div>' +
          '<div class="m-tiles">' +
            '<div class="m-tile"><div class="v" style="color:#ffbe55">12</div><div class="k">Day streak</div></div>' +
            '<div class="m-tile"><div class="v" style="color:#93c2ff">3.4</div><div class="k">Avg mood</div></div>' +
            '<div class="m-tile"><div class="v" style="color:#3ddc92">28</div><div class="k">Entries</div></div>' +
          '</div>' +
          '<div class="m-ins green" style="animation-delay:.15s">' +
            '<div class="k">Quick tools</div>' +
            '<div class="t">Journal · Sleep · SOS Calm · DBT</div>' +
            '<div class="d">Reordered around what you actually reach for.</div>' +
          '</div>';
      }
    },
    {
      id: 'trends',
      label: 'Trends',
      copyTitle: 'Two weeks in, a shape appears.',
      copyText: 'One bad Tuesday stops looking like a trend once there is a line through it. The rolling average is the part you could never hold in your head.',
      render: function () {
        return '' +
          '<div class="scr-s">Progress over time</div>' +
          '<div class="scr-h">Mood trend</div>' +
          '<div class="m-chart" style="margin-top:14px">' + chartSVG() + '</div>' +
          '<div class="m-tiles">' +
            '<div class="m-tile"><div class="v" style="color:#93c2ff">3.4</div><div class="k">Average</div></div>' +
            '<div class="m-tile"><div class="v" style="color:#3ddc92">↑ 34%</div><div class="k">vs last month</div></div>' +
            '<div class="m-tile"><div class="v" style="color:#ffbe55">14</div><div class="k">Days logged</div></div>' +
          '</div>' +
          '<div class="scr-s" style="margin:14px 0 8px">Consistency</div>' +
          heatGrid();
      }
    },
    {
      id: 'insights',
      label: 'Insights',
      copyTitle: 'Then it tells you something you did not know.',
      copyText: 'Correlations pulled from your own logs — not generic advice. This is the part that changes behaviour, because it is about you specifically.',
      render: function () {
        return '' +
          '<div class="scr-s">What we are noticing</div>' +
          '<div class="scr-h">Your patterns</div>' +
          '<div style="margin-top:16px">' +
            '<div class="m-ins" style="animation-delay:.05s">' +
              '<div class="k">Strong correlation</div>' +
              '<div class="t">Sleep is your biggest lever</div>' +
              '<div class="d">Nights under 6 hours are followed by a mood drop about 78% of the time.</div>' +
            '</div>' +
            '<div class="m-ins gold" style="animation-delay:.18s">' +
              '<div class="k">Noticing</div>' +
              '<div class="t">You come alive outdoors</div>' +
              '<div class="d">Every week you rated 4+ included time outside or making something.</div>' +
            '</div>' +
            '<div class="m-ins green" style="animation-delay:.31s">' +
              '<div class="k">Since 14 July</div>' +
              '<div class="t">The line is moving</div>' +
              '<div class="d">Your 7-day average is up from 2.4 to 3.4 since the medication change.</div>' +
            '</div>' +
            '<div class="m-ins" style="animation-delay:.44s">' +
              '<div class="k">Worth watching</div>' +
              '<div class="t">Sunday evenings dip</div>' +
              '<div class="d">Consistently your lowest window. Worth planning something for.</div>' +
            '</div>' +
          '</div>';
      }
    },
    {
      id: 'bandura',
      label: 'Bandura',
      copyTitle: 'And there is someone to say it to.',
      copyText: 'Bandura opens having already read the week above. No recap, no explaining yourself — it can start at the thing that is actually bothering you.',
      render: function () {
        return '' +
          '<div class="scr-s">Session · 11:48pm</div>' +
          '<div class="scr-h">Bandura</div>' +
          '<div class="m-chat" style="margin-top:16px">' +
            '<div class="bub ai" style="animation-delay:.05s">I can see it has been a rough few days — three 2s in a row, and you were up past 2am on Monday. Do you want to get into it, or would you rather wind down?</div>' +
            '<div class="bub me" style="animation-delay:.55s">honestly I just feel behind on everything</div>' +
            '<div class="bub ai" style="animation-delay:1.05s">That word comes up a lot in your entries around deadlines. Behind compared to what, though — the plan, or what is actually possible this week?</div>' +
            '<div class="bub me" style="animation-delay:1.7s">…the plan, I guess</div>' +
            '<div class="bub ai typing" style="animation-delay:2.2s"><i></i><i></i><i></i></div>' +
          '</div>';
      }
    }
  ];

  var idx = 0, auto = null, interacted = false;

  function paint(i, userDriven) {
    idx = i;
    var s = SCREENS[i];

    stage.innerHTML = '<div class="scr" id="scrLive">' + s.render() + '</div>' +
      '<div class="m-nav">' + SCREENS.map(function (_, j) {
        return '<b class="' + (j === i ? 'on' : '') + '"></b>';
      }).join('') + '</div>';

    // next frame, so the entrance transition actually runs
    requestAnimationFrame(function () {
      var live = document.getElementById('scrLive');
      if (live) live.classList.add('on');
    });

    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b, j) {
      b.setAttribute('aria-selected', String(j === i));
    });

    var ct = document.getElementById('demoTitle');
    var cp = document.getElementById('demoText');
    if (ct) ct.textContent = s.copyTitle;
    if (cp) cp.textContent = s.copyText;

    if (userDriven) stop();
  }

  function stop() {
    interacted = true;
    if (auto) { clearInterval(auto); auto = null; }
    var hint = document.getElementById('demoHint');
    if (hint) hint.textContent = 'Sample data, shown to demonstrate the interface.';
  }

  SCREENS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.label;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(i === 0));
    b.addEventListener('click', function () { paint(i, true); });
    seg.appendChild(b);
  });
  seg.setAttribute('role', 'tablist');

  paint(0, false);

  /* Cycle through once so a passing visitor sees there is more than one screen,
     then stop for good the moment they take control (or if motion is reduced). */
  if (!reduce) {
    var shown = 1;
    auto = setInterval(function () {
      if (interacted) return;
      shown++;
      paint(shown % SCREENS.length, false);
      if (shown >= SCREENS.length) stop();
    }, 4200);
  }
})();
