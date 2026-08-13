/* "Log a week" — a hands-on version of the core loop.
 *
 * Tap a mood for each day; the line, the average and the read-out update live.
 * Nothing is stored or sent — it resets on reload, like every other interactive
 * piece on this site.
 */
(function () {
  'use strict';

  var host = document.getElementById('moodLab');
  if (!host) return;

  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var LEVELS = [
    { v: 5, label: 'Great', color: '#3ddc92' },
    { v: 4, label: 'Good', color: '#93c2ff' },
    { v: 3, label: 'OK', color: '#5b9dff' },
    { v: 2, label: 'Low', color: '#ffbe55' },
    { v: 1, label: 'Rough', color: '#ff6b6b' }
  ];

  var W = 620, H = 300;
  var padL = 54, padR = 18, padT = 22, padB = 44;
  var colW = (W - padL - padR) / (DAYS.length - 1);
  var rowH = (H - padT - padB) / (LEVELS.length - 1);

  var state = new Array(DAYS.length).fill(null);

  var x = function (i) { return padL + i * colW; };
  var y = function (v) { return padT + (5 - v) * rowH; };

  function svg() {
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Tap a mood for each day">' +
      '<defs>' +
        '<linearGradient id="labg" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#5b9dff"/><stop offset="100%" stop-color="#f0c98c"/>' +
        '</linearGradient>' +
        '<linearGradient id="labf" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#5b9dff" stop-opacity=".28"/>' +
          '<stop offset="100%" stop-color="#5b9dff" stop-opacity="0"/>' +
        '</linearGradient>' +
      '</defs>';

    // row guides + y labels
    LEVELS.forEach(function (L) {
      s += '<line x1="' + padL + '" y1="' + y(L.v) + '" x2="' + (W - padR) + '" y2="' + y(L.v) +
           '" stroke="rgba(255,255,255,.05)" stroke-width="1"/>';
      s += '<text class="lab-ylbl" x="' + (padL - 12) + '" y="' + (y(L.v) + 3.5) +
           '" text-anchor="end" fill="#51688c">' + L.label + '</text>';
    });

    // filled area + line
    s += '<path class="lab-fill" id="labFill" d=""/><path class="lab-line" id="labLine" d=""/>';

    // nodes
    DAYS.forEach(function (d, i) {
      LEVELS.forEach(function (L) {
        var on = state[i] === L.v;
        var r = on ? 8 : 4.5;
        var fill = on ? L.color : 'rgba(255,255,255,.16)';
        var op = on ? 1 : (state[i] === null ? 0.85 : 0.3);
        s += '<circle class="lab-node" data-day="' + i + '" data-v="' + L.v + '" cx="' + x(i) +
             '" cy="' + y(L.v) + '" r="' + r + '" fill="' + fill + '" opacity="' + op + '"/>';
        // generous invisible tap target
        s += '<circle class="lab-hit" data-day="' + i + '" data-v="' + L.v + '" cx="' + x(i) +
             '" cy="' + y(L.v) + '" r="' + Math.min(colW, rowH) / 2 + '"/>';
      });
      s += '<text class="lab-lbl" x="' + x(i) + '" y="' + (H - padB + 24) +
           '" text-anchor="middle" fill="#5a7096">' + d + '</text>';
    });

    return s + '</svg>';
  }

  function paths() {
    var pts = [];
    state.forEach(function (v, i) { if (v !== null) pts.push([x(i), y(v)]); });
    var line = document.getElementById('labLine');
    var fill = document.getElementById('labFill');
    if (!line || !fill) return;

    if (pts.length < 2) { line.setAttribute('d', ''); fill.setAttribute('d', ''); return; }

    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var px = pts[i - 1], cx = pts[i];
      var mx = (px[0] + cx[0]) / 2;
      d += ' C' + mx + ',' + px[1] + ' ' + mx + ',' + cx[1] + ' ' + cx[0] + ',' + cx[1];
    }
    line.setAttribute('d', d);
    fill.setAttribute('d', d + ' L' + pts[pts.length - 1][0] + ',' + (H - padB) +
                          ' L' + pts[0][0] + ',' + (H - padB) + ' Z');
  }

  function readout() {
    var out = document.getElementById('labOut');
    var count = document.getElementById('labCount');
    var filled = state.filter(function (v) { return v !== null; });
    count.textContent = filled.length + ' of 7 days logged';

    if (filled.length < 3) {
      out.className = 'lab-out empty';
      out.innerHTML = '<div class="k">Waiting on data</div>' +
        '<div class="t">Tap a mood for at least three days.</div>' +
        '<p>This is the whole daily obligation in the real app — one tap. The interesting part only shows up once there are a few days to compare.</p>';
      return;
    }

    var avg = filled.reduce(function (a, b) { return a + b; }, 0) / filled.length;

    // trend: mean of the logged days in the back half vs the front half
    var idx = [];
    state.forEach(function (v, i) { if (v !== null) idx.push(i); });
    var half = Math.floor(idx.length / 2);
    var early = idx.slice(0, half).map(function (i) { return state[i]; });
    var late = idx.slice(idx.length - half).map(function (i) { return state[i]; });
    var mean = function (a) { return a.reduce(function (x2, y2) { return x2 + y2; }, 0) / a.length; };
    var delta = half ? mean(late) - mean(early) : 0;

    var best = idx.reduce(function (a, b) { return state[b] > state[a] ? b : a; }, idx[0]);
    var worst = idx.reduce(function (a, b) { return state[b] < state[a] ? b : a; }, idx[0]);
    var spread = state[best] - state[worst];

    var headline, body;
    if (Math.abs(delta) < 0.5) {
      headline = 'Fairly steady across the week.';
      body = 'Your average sat at ' + avg.toFixed(1) + ' out of 5. Steady is genuinely useful information — it means whatever moved your mood was smaller than day-to-day noise.';
    } else if (delta > 0) {
      headline = 'The week trended upward.';
      body = 'Your average was ' + avg.toFixed(1) + ', and the back half came in about ' + Math.abs(delta).toFixed(1) + ' points higher than the front. Worth asking what changed — that is exactly the question the app keeps asking on your behalf.';
    } else {
      headline = 'The week trended downward.';
      body = 'Your average was ' + avg.toFixed(1) + ', and the back half came in about ' + Math.abs(delta).toFixed(1) + ' points lower than the front. One week is not a pattern — but it is the kind of drift that is very easy to miss from the inside.';
    }

    if (spread >= 3) {
      body += ' The gap between ' + DAYS[best] + ' and ' + DAYS[worst] + ' was ' + spread +
              ' points, which is a big swing for seven days.';
    }

    out.className = 'lab-out';
    out.innerHTML = '<div class="k">What one week already shows</div>' +
      '<div class="t">' + headline + '</div><p>' + body + '</p>';
  }

  function draw() {
    host.innerHTML = svg();
    host.querySelectorAll('.lab-hit, .lab-node').forEach(function (n) {
      n.addEventListener('click', function () {
        var d = +n.getAttribute('data-day'), v = +n.getAttribute('data-v');
        state[d] = state[d] === v ? null : v;   // tap again to clear
        draw();
      });
    });
    paths();
    readout();
  }

  var reset = document.getElementById('labReset');
  if (reset) reset.addEventListener('click', function () {
    state = new Array(DAYS.length).fill(null);
    draw();
  });

  draw();
})();
