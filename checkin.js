/* Free self-screeners — PHQ-9 and GAD-7.
   Everything runs in the browser. Answers are held in a local variable, never
   persisted and never transmitted; reloading the page discards them.

   Safety rule that matters most here: PHQ-9 item 9 asks about thoughts of being
   better off dead or of self-harm. ANY non-zero answer there surfaces crisis
   resources above the score, regardless of the total — a low total with a
   positive item 9 is exactly the case a naive sum would bury. */

(function () {
  var SCALE = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

  var TESTS = {
    phq9: {
      name: 'PHQ-9',
      full: 'Patient Health Questionnaire',
      max: 27,
      riskItem: 8, // 0-indexed: "thoughts that you would be better off dead…"
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
        [0, 4, 'Minimal', '#2a9e6a', 'Your answers suggest minimal or no depressive symptoms. That is worth noting rather than dismissing — whatever you are doing for your sleep, movement and connection appears to be holding.'],
        [5, 9, 'Mild', '#EF9F27', 'Your answers suggest mild depressive symptoms. This is the range where small, boring, consistent things genuinely move the needle: sleep, daylight, movement, and talking to someone. Speaking with a therapist is a worthwhile step, not an overreaction.'],
        [10, 14, 'Moderate', '#EF9F27', 'Your answers suggest moderate depression. This is the point where most guidance recommends speaking with a mental health professional rather than trying to manage it alone. Cognitive behavioural therapy has strong evidence at this level.'],
        [15, 19, 'Moderately Severe', '#E24B4A', 'Your answers suggest moderately severe depression. Please reach out to a mental health professional soon. This is treatable, effective options exist including therapy and medication, and waiting rarely makes it easier.'],
        [20, 27, 'Severe', '#E24B4A', 'Your answers suggest severe depression. Please seek professional help — this week, not eventually. If you are in crisis or having thoughts of harming yourself, use the crisis numbers on this page right now.']
      ]
    },
    gad7: {
      name: 'GAD-7',
      full: 'Generalized Anxiety Disorder Scale',
      max: 21,
      riskItem: -1,
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
        [0, 4, 'Minimal', '#2a9e6a', 'Your answers suggest minimal anxiety. Worth keeping an eye on if your circumstances change, but nothing here points to a problem right now.'],
        [5, 9, 'Mild', '#EF9F27', 'Your answers suggest mild anxiety. Breathing work, regular movement, protecting your sleep and watching caffeine all have real evidence behind them at this level.'],
        [10, 14, 'Moderate', '#EF9F27', 'Your answers suggest moderate anxiety. This is the range where talking to a professional is genuinely worth doing — CBT and exposure-based approaches have strong evidence and often work faster than people expect.'],
        [15, 21, 'Severe', '#E24B4A', 'Your answers suggest severe anxiety. Please consult a mental health professional soon. Anxiety at this level is exhausting and highly treatable — do not wait it out alone.']
      ]
    }
  };

  var CRISIS_HTML =
    '<div class="crisis">' +
      '<h3>Before your score — please read this</h3>' +
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

  var el = function (id) { return document.getElementById(id); };
  var intro = el('intro'), pick = el('pick'), quiz = el('quiz'), result = el('result');
  if (!quiz) return;

  var current = null, answers = [], idx = 0;

  function show(section) {
    intro.style.display = section === 'pick' ? '' : 'none';
    pick.style.display = section === 'pick' ? '' : 'none';
    quiz.classList.toggle('live', section === 'quiz');
    result.classList.toggle('live', section === 'result');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function start(key) {
    current = TESTS[key];
    answers = [];
    idx = 0;
    show('quiz');
    render();
  }

  function render() {
    var total = current.questions.length;
    el('qprog').style.width = (idx / total * 100) + '%';
    el('qcount').textContent = current.name + ' · Question ' + (idx + 1) + ' of ' + total;
    el('qtext').textContent = current.questions[idx];
    el('qback').style.visibility = idx === 0 ? 'hidden' : 'visible';

    var opts = el('qopts');
    opts.innerHTML = '';
    SCALE.forEach(function (label, value) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.innerHTML = '<span class="mark"></span><span>' + label + '</span>';
      b.addEventListener('click', function () { answer(value); });
      opts.appendChild(b);
    });
  }

  function answer(value) {
    answers[idx] = value;
    if (idx < current.questions.length - 1) {
      idx++;
      render();
    } else {
      finish();
    }
  }

  function finish() {
    var total = answers.reduce(function (a, b) { return a + b; }, 0);

    var band = current.severity[current.severity.length - 1];
    for (var i = 0; i < current.severity.length; i++) {
      if (total >= current.severity[i][0] && total <= current.severity[i][1]) {
        band = current.severity[i];
        break;
      }
    }

    // Item-9 safety check runs independently of the total score.
    var flagged = current.riskItem >= 0 && answers[current.riskItem] > 0;
    el('crisisSlot').innerHTML = flagged ? CRISIS_HTML : '';

    el('scoreN').textContent = total;
    el('scoreN').style.color = band[3];
    el('scoreOf').textContent = 'out of ' + current.max + ' · ' + current.name;
    el('scoreBand').textContent = band[2];
    el('scoreBand').style.color = band[3];
    el('scoreBand').style.background = band[3] + '22';
    el('scoreBand').style.border = '1px solid ' + band[3] + '55';
    el('scoreSay').textContent = band[4];

    show('result');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.pick'), function (b) {
    b.addEventListener('click', function () { start(b.getAttribute('data-test')); });
  });

  el('qback').addEventListener('click', function () {
    if (idx > 0) { idx--; render(); }
  });

  el('again').addEventListener('click', function () {
    answers = []; idx = 0; current = null;
    show('pick');
  });
})();
