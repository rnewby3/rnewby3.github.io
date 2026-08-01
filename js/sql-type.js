/* Shared SQL typewriter for the static query headers on work.html and
   datasets.html.

   The console (index.html) keeps its own copy: its type() is wired into tab
   switching, result rendering and the lineage graph, so it re-runs on every
   query. These pages have exactly one query that runs once on load, so they
   get the simpler thing rather than importing machinery they never use.

   Token format matches the console: [className, text], where "p" means plain.

   Timing is 11ms/char, same as the console, so a visitor moving between pages
   sees one consistent behaviour rather than two rates.
*/
(function () {
  var SPEED = 11;

  function span(cls, text) {
    return '<span class="' + (cls === 'p' ? '' : cls) + '">' + text + '</span>';
  }

  function paintAll(tokens) {
    return tokens.map(function (t) { return span(t[0], t[1]); }).join('');
  }

  /* el      — the .sql container
     tokens  — [[class, text], ...]
     status  — optional element for "running…" / "ok"
     ms      — optional element for the fake timing readout
     rows    — optional row count, appended to the ok state as "N rows" */
  window.sqlType = function (el, tokens, opts) {
    opts = opts || {};
    var status = opts.status ? document.getElementById(opts.status) : null;
    var msEl = opts.ms ? document.getElementById(opts.ms) : null;

    function finish(html) {
      el.innerHTML = html;
      if (status) status.textContent = 'ok';
      // Same 6-17ms band the console reports. It is decoration, and it is
      // labelled as a query time on a page with no query, so it stays in the
      // range a real one would plausibly land in.
      if (msEl) msEl.textContent = (6 + Math.floor(Math.random() * 12)) + ' ms';
    }

    // Respect reduced motion: paint the finished state, skip the animation.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish(paintAll(tokens));
      return;
    }

    if (status) status.textContent = 'running…';
    if (msEl) msEl.textContent = '';

    var seg = 0, ch = 0, out = '';
    var timer = setInterval(function () {
      if (seg >= tokens.length) { clearInterval(timer); finish(out); return; }
      var cls = tokens[seg][0], text = tokens[seg][1];
      ch++;
      var piece = span(cls, text.slice(0, ch));
      el.innerHTML = out + piece + '<span class="caret"></span>';
      if (ch >= text.length) { out += piece; seg++; ch = 0; }
    }, SPEED);
  };
})();
