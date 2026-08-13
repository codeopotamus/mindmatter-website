/* Feature explorer on the features page.
 *
 * Every panel's content is already in the HTML — this only toggles which one is
 * visible. With JS off, the first panel shows and the rest stay in the markup
 * for crawlers, so nothing is lost.
 */
(function () {
  'use strict';

  var list = document.getElementById('explList');
  var panel = document.getElementById('explPanel');
  if (!list || !panel) return;

  var buttons = list.querySelectorAll('button');
  var panels = panel.querySelectorAll('.expl-body');

  function select(id, focus) {
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-panel') === id));
    });
    Array.prototype.forEach.call(panels, function (p) {
      var on = p.id === 'p-' + id;
      p.hidden = !on;
      if (on) {
        // restart the entrance animation
        p.classList.remove('expl-fade');
        void p.offsetWidth;
        p.classList.add('expl-fade');
      }
    });
    if (focus) {
      var b = list.querySelector('[data-panel="' + id + '"]');
      if (b) b.focus();
    }
  }

  Array.prototype.forEach.call(buttons, function (b, i) {
    b.addEventListener('click', function () { select(b.getAttribute('data-panel')); });
    b.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % buttons.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
      if (next === null) return;
      e.preventDefault();
      select(buttons[next].getAttribute('data-panel'), true);
    });
  });
})();
