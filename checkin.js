/* Free self-screeners — PHQ-9, GAD-7, ASRS-v1.1 Part A, and a combined
 * "full check-in" that runs all three.
 *
 * ── Licensing ───────────────────────────────────────────────────────────────
 * Only instruments that are unambiguously free for commercial use appear here:
 *   PHQ-9   public domain   GAD-7   public domain
 *   ASRS    WHO, no permission required
 * The app ships fifteen more (MDQ, PCL-5, OCI-R, ULS-8 …) whose licences read
 * "commercial use not yet verified" — those deliberately stay out of a public
 * marketing site.
 *
 * ── Safety ──────────────────────────────────────────────────────────────────
 * PHQ-9 item 9 asks about thoughts of being better off dead or of self-harm.
 * ANY non-zero answer surfaces crisis resources above the score, in every mode,
 * regardless of the total. A low total with a positive item 9 is precisely the
 * person a score-threshold trigger would miss. Do not make this conditional.
 *
 * ── Privacy ─────────────────────────────────────────────────────────────────
 * No storage, no network, no analytics. Answers live in a local variable and
 * die with the tab. The page promises this to the reader; keep it true.
 */
(function () {
  'use strict';

  var FREQ4 = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
  var FREQ5 = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'];

  var INSTRUMENTS = {
    phq9: {
      name: 'PHQ-9', domain: 'Mood', icon: '🧠', max: 27, riskItem: 8,
      cite: 'Kroenke, Spitzer &amp; Williams, 2001',
      lead: 'Over the last two weeks, how often have you been bothered by…',
      scale: FREQ4, vals: [0, 1, 2, 3], mode: 'sum',
      questions: [
        'Little interest or pleasure in doing things you normally enjoy',
        'Feeling down, depressed, hopeless, or empty inside',
        'Trouble falling or staying asleep, or sleeping too much',
        'Feeling tired, fatigued, or having very little energy',
        'Poor appetite, significant weight loss, or overeating',
        'Feeling bad about yourself — worthless, like a burden, or a failure',
        'Trouble concentrating on things such as reading, watching TV, or working',
        'Moving or speaking so slowly that others have noticed, or being so fidgety you cannot sit still',
        'Thoughts that you would be better off dead, or thoughts of hurting yourself in any way'
      ],
      severity: [
        [0, 4, 'Minimal', '#2a9e6a', 'Your answers suggest minimal or no depressive symptoms. Worth noting rather than dismissing — whatever you are doing for sleep, movement and connection appears to be holding.'],
        [5, 9, 'Mild', '#EF9F27', 'Your answers suggest mild depressive symptoms. This is the range where boring, consistent things genuinely move the needle: sleep, daylight, movement, and talking to someone. Seeing a therapist here is a reasonable step, not an overreaction.'],
        [10, 14, 'Moderate', '#EF9F27', 'Your answers suggest moderate depression. This is the point where most guidance recommends speaking with a mental health professional rather than managing it alone. CBT has strong evidence at this level.'],
        [15, 19, 'Moderately severe', '#E24B4A', 'Your answers suggest moderately severe depression. Please reach out to a professional soon. This is treatable — therapy and medication both have good evidence — and waiting rarely makes it easier.'],
        [20, 27, 'Severe', '#E24B4A', 'Your answers suggest severe depression. Please seek professional help this week, not eventually. If you are in crisis, use the numbers on this page now.']
      ]
    },

    gad7: {
      name: 'GAD-7', domain: 'Anxiety', icon: '💭', max: 21, riskItem: -1,
      cite: 'Spitzer, Kroenke, Williams &amp; Löwe, 2006',
      lead: 'Over the last two weeks, how often have you been bothered by…',
      scale: FREQ4, vals: [0, 1, 2, 3], mode: 'sum',
      questions: [
        'Feeling nervous, anxious, on edge, or keyed up',
        'Not being able to stop or control worrying even when you want to',
        'Worrying too much about many different things at once',
        'Trouble relaxing or winding down, even in calm situations',
        'Being so restless or tense that it is hard to sit still',
        'Becoming easily annoyed, irritable, or snapping at people',
        'Feeling afraid, as if something awful is about to happen'
      ],
      severity: [
        [0, 4, 'Minimal', '#2a9e6a', 'Your answers suggest minimal anxiety. Worth watching if circumstances change, but nothing here points to a problem right now.'],
        [5, 9, 'Mild', '#EF9F27', 'Your answers suggest mild anxiety. Breathing work, regular movement, protecting sleep and watching caffeine all have real evidence at this level.'],
        [10, 14, 'Moderate', '#EF9F27', 'Your answers suggest moderate anxiety. Worth talking to a professional — CBT and exposure-based approaches have strong evidence and often work faster than people expect.'],
        [15, 21, 'Severe', '#E24B4A', 'Your answers suggest severe anxiety. Please consult a professional soon. Anxiety at this level is exhausting and highly treatable — do not wait it out alone.']
      ]
    },

    asrs: {
      name: 'ASRS-v1.1', domain: 'Focus & attention', icon: '⚡', max: 6, riskItem: -1,
      cite: 'Kessler et al., 2005 (WHO)',
      lead: 'Over the past 6 months, how often have you experienced…',
      scale: FREQ5, vals: [0, 1, 2, 3, 4], mode: 'thresholdCount',
      // Official Part A scoring: items 1–3 screen positive at "Sometimes",
      // items 4–6 only at "Often". Summing raw frequencies over-weights
      // hyperactivity and misses quieter inattentive presentations.
      thresholds: [2, 2, 2, 3, 3, 3],
      questions: [
        'Trouble wrapping up the final details of a project, once the challenging parts are done',
        'Difficulty getting things in order when you have to do a task requiring organisation',
        'Problems remembering appointments or obligations you have made',
        'Avoiding or delaying getting started on a task that requires a lot of thought',
        'Fidgeting or squirming when you have to sit down for a long time',
        'Feeling overly active and compelled to do things, like you were driven by a motor'
      ],
      severity: [
        [0, 3, 'Below screening threshold', '#2a9e6a', 'Fewer than four answers reached that question\'s threshold, so this screen is negative. A negative screen is not proof of absence — the ASRS is known to miss quieter, inattentive presentations. If focus problems are genuinely costing you, that is worth a conversation regardless of this result.'],
        [4, 6, 'Positive screen', '#E24B4A', 'Four or more answers reached their threshold — a positive ASRS screen, the level at which the WHO recommends a full evaluation. This is not a diagnosis: a real ADHD assessment examines your history, functioning, and other explanations. A psychiatrist or psychologist can do that properly.']
      ]
    }
  };

  var MODES = {
    phq9: { title: 'PHQ-9 · Depression', parts: ['phq9'] },
    gad7: { title: 'GAD-7 · Anxiety', parts: ['gad7'] },
    full: { title: 'Full check-in', parts: ['phq9', 'gad7', 'asrs'] }
  };

  var CRISIS_HTML =
    '<div class="crisis">' +
      '<h3>Before your results — please read this</h3>' +
      '<p>You indicated some thoughts of being better off dead or of hurting yourself. ' +
      'That matters more than any number on this page, and it deserves a person rather ' +
      'than an app. You are not overreacting by reaching out, and you do not have to be ' +
      'in immediate danger to deserve support.</p>' +
      '<ul>' +
        '<li><b>Call or text 988</b> — Suicide &amp; Crisis Lifeline (US), 24/7</li>' +
        '<li><b>Text HOME to 741741</b> — Crisis Text Line</li>' +
        '<li><b>Call 911</b> — or your local emergency number, if you are in immediate danger</li>' +
        '<li><b>findahelpline.com</b> — to find your local line outside the US</li>' +
      '</ul>' +
      '<p style="margin-top:14px;margin-bottom:0">If you can, tell someone you trust today — ' +
      'a friend, a family member, your doctor. Saying it out loud to one person is often the ' +
      'hardest and most useful step.</p>' +
    '</div>';

  var $ = function (id) { return document.getElementById(id); };
  var intro = $('intro'), pick = $('pick'), quiz = $('quiz'), result = $('result');
  if (!quiz) return;

  var mode = null, queue = [], answers = {}, flat = [], pos = 0;

  function show(which) {
    if (intro) intro.style.display = which === 'pick' ? '' : 'none';
    if (pick) pick.style.display = which === 'pick' ? '' : 'none';
    quiz.classList.toggle('live', which === 'quiz');
    result.classList.toggle('live', which === 'result');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function start(key) {
    mode = MODES[key];
    if (!mode) return;
    queue = mode.parts.slice();
    answers = {};
    flat = [];
    queue.forEach(function (k) {
      answers[k] = [];
      INSTRUMENTS[k].questions.forEach(function (_, qi) { flat.push({ inst: k, q: qi }); });
    });
    pos = 0;
    show('quiz');
    render();
  }

  function scaleFor(inst, qi) {
    var I = INSTRUMENTS[inst];
    if (I.itemScales && I.itemScales[qi]) return I.itemScales[qi];
    return { scale: I.scale, vals: I.vals };
  }

  function render() {
    var step = flat[pos];
    var I = INSTRUMENTS[step.inst];
    var sc = scaleFor(step.inst, step.q);

    $('qprog').style.width = (pos / flat.length * 100) + '%';

    var flag = $('qflag');
    if (flag) {
      if (mode.parts.length > 1) {
        var si = mode.parts.indexOf(step.inst) + 1;
        flag.innerHTML = '<span>' + I.icon + '</span> Section ' + si + ' of ' + mode.parts.length + ' · ' + I.domain;
        flag.style.display = '';
      } else {
        flag.style.display = 'none';
      }
    }

    $('qcount').textContent = I.name + ' · Question ' + (step.q + 1) + ' of ' + I.questions.length +
      (mode.parts.length > 1 ? '  ·  ' + (pos + 1) + '/' + flat.length + ' overall' : '');
    $('qlead').textContent = I.lead;
    $('qtext').textContent = I.questions[step.q];
    $('qback').style.visibility = pos === 0 ? 'hidden' : 'visible';

    var opts = $('qopts');
    var chosen = answers[step.inst][step.q];
    var answered = typeof chosen === 'number';

    opts.innerHTML = '';
    sc.scale.forEach(function (label, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      var isSel = answered && chosen === sc.vals[i];
      b.innerHTML = '<span class="mark' + (isSel ? ' sel' : '') + '"></span><span>' + label + '</span>';
      b.addEventListener('click', function () { answer(sc.vals[i]); });
      opts.appendChild(b);
    });

    // The pointer has not moved, so the option now sitting under it would show
    // its hover state and look pre-selected. Hold hover off until a real move.
    opts.classList.add('no-hover');
  }

  function answer(value) {
    var step = flat[pos];
    answers[step.inst][step.q] = value;
    if (pos < flat.length - 1) { pos++; render(); }
    else { finish(); }
  }

  function scoreOne(key) {
    var I = INSTRUMENTS[key];
    var a = answers[key];
    var total;

    if (I.mode === 'thresholdCount') {
      total = 0;
      for (var i = 0; i < a.length; i++) if (a[i] >= I.thresholds[i]) total++;
    } else {
      total = a.reduce(function (x, y) { return x + (y || 0); }, 0);
    }

    var band = I.severity[I.severity.length - 1];
    for (var j = 0; j < I.severity.length; j++) {
      if (total >= I.severity[j][0] && total <= I.severity[j][1]) { band = I.severity[j]; break; }
    }
    return { total: total, band: band, inst: I };
  }

  function finish() {
    // Item-9 check runs independently of every total score, in every mode.
    var flagged = false;
    if (answers.phq9 && answers.phq9.length) {
      var ri = INSTRUMENTS.phq9.riskItem;
      flagged = answers.phq9[ri] > 0;
    }
    $('crisisSlot').innerHTML = flagged ? CRISIS_HTML : '';

    var single = mode.parts.length === 1;
    var scores = mode.parts.map(scoreOne);

    $('scoreCard').style.display = single ? '' : 'none';
    $('profile').style.display = single ? 'none' : '';

    if (single) {
      var s = scores[0];
      $('scoreN').textContent = s.total;
      $('scoreN').style.color = s.band[3];
      $('scoreOf').textContent = 'out of ' + s.inst.max + ' · ' + s.inst.name;
      $('scoreBand').textContent = s.band[2];
      $('scoreBand').style.color = s.band[3];
      $('scoreBand').style.background = s.band[3] + '22';
      $('scoreBand').style.border = '1px solid ' + s.band[3] + '55';
      $('scoreSay').textContent = s.band[4];
    } else {
      var html = '';
      scores.forEach(function (s) {
        var pct = Math.max(4, Math.round(s.total / s.inst.max * 100));
        var label = s.inst.mode === 'thresholdCount'
          ? s.total + ' of 6 items flagged'
          : s.total + ' / ' + s.inst.max;
        html += '<div class="domain">' +
          '<div class="domain-top">' +
            '<div class="domain-name">' + s.inst.icon + ' ' + s.inst.domain +
              '<small>' + s.inst.name + ' · ' + s.inst.cite + '</small></div>' +
            '<div class="domain-val" style="color:' + s.band[3] + '">' + s.band[2] +
              '<small style="display:block;font-weight:400;font-size:12px;color:var(--dim);text-align:right">' + label + '</small></div>' +
          '</div>' +
          '<div class="meter"><i data-w="' + pct + '" style="background:' + s.band[3] + '"></i></div>' +
          '<p class="domain-say">' + s.band[4] + '</p>' +
        '</div>';
      });
      $('domains').innerHTML = html;

      var raised = scores.filter(function (s) { return s.band[3] !== '#2a9e6a'; });
      $('profileSay').textContent = raised.length === 0
        ? 'Nothing in this check-in reached a threshold that typically warrants follow-up. That is genuinely worth knowing — and if your lived experience disagrees with these numbers, trust yourself over the questionnaire.'
        : raised.length === 1
          ? 'One area came back above a screening threshold: ' + raised[0].inst.domain.toLowerCase() + '. That is a signal worth taking to a professional, not a diagnosis.'
          : raised.length + ' areas came back above a screening threshold: ' +
            raised.map(function (s) { return s.inst.domain.toLowerCase(); }).join(', ') +
            '. Areas often interact — treating one frequently improves the others — which is exactly the kind of thing a clinician can untangle with you.';

      // animate the meters after paint
      requestAnimationFrame(function () {
        setTimeout(function () {
          Array.prototype.forEach.call($('domains').querySelectorAll('.meter i'), function (b) {
            b.style.width = b.getAttribute('data-w') + '%';
          });
        }, 120);
      });
    }

    show('result');
  }

  // a genuine pointer move re-enables hover styling
  document.addEventListener('pointermove', function () {
    var opts = $('qopts');
    if (opts && opts.classList.contains('no-hover')) opts.classList.remove('no-hover');
  }, { passive: true });

  Array.prototype.forEach.call(document.querySelectorAll('.pick'), function (b) {
    b.addEventListener('click', function () { start(b.getAttribute('data-test')); });
  });

  $('qback').addEventListener('click', function () {
    if (pos > 0) { pos--; render(); }
  });

  $('again').addEventListener('click', function () {
    mode = null; answers = {}; flat = []; pos = 0;
    show('pick');
  });

  // number keys pick an option while a question is showing
  document.addEventListener('keydown', function (e) {
    if (!quiz.classList.contains('live')) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 5) {
      var opts = $('qopts').querySelectorAll('.opt');
      if (opts[n - 1]) opts[n - 1].click();
    } else if (e.key === 'Backspace' && pos > 0) {
      e.preventDefault(); pos--; render();
    }
  });
})();
