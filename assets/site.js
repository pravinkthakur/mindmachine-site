(function () {
  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var src = btn.getAttribute('data-copy-from');
      if (src) { var el = document.getElementById(src); if (el) text = el.value || el.textContent; }
      var done = function () { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1600); };
      try {
        navigator.clipboard.writeText(text).then(done, function () { selectText(btn); });
      } catch (e) { selectText(btn); }
    });
  });
  function selectText(btn) {
    var target = btn.previousElementSibling;
    if (!target) return;
    var r = document.createRange(); r.selectNodeContents(target);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  // Contact form: submit to Formspree; confirm only verified success, with email fallback.
  var form = document.getElementById('problem-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var fallback = document.getElementById('form-fallback');
  var summary = document.getElementById('fallback-text');
  var sending = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    fallback.hidden = true;
    var errors = [];
    form.querySelectorAll('[required]').forEach(function (f) {
      var ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
      if (f.type === 'email' && ok) ok = /.+@.+\..+/.test(f.value);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) errors.push(f);
    });
    var err = document.getElementById('form-error');
    if (errors.length) {
      err.hidden = false;
      err.textContent = 'Please complete the highlighted fields: your name, a work email and a short description of the problem.';
      errors[0].focus();
      return;
    }
    err.hidden = true;

    var data = new FormData(form);
    var btn = form.querySelector('button[type="submit"]');
    sending = true;
    btn.disabled = true;
    btn.textContent = 'Sending';

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Submission rejected: ' + res.status);
        return res.json();
      })
      .then(function (result) {
        if (!result || result.error || (Array.isArray(result.errors) && result.errors.length)) {
          throw new Error('Submission error');
        }
        showSent();
      })
      .catch(function () { showFallback(data); })
      .finally(function () {
        sending = false;
        btn.disabled = false;
        btn.textContent = 'Send your problem';
      });
  });

  function showSent() {
    form.hidden = true;
    fallback.hidden = true;
    status.hidden = false;
    status.focus();
  }
  function showFallback(data) {
    var lines = [
      'Name: ' + (data.get('name') || ''),
      'Email: ' + (data.get('email') || ''),
      'Organisation: ' + (data.get('organisation') || ''),
      'Role: ' + (data.get('role') || ''),
      'Area: ' + (data.get('service') || ''),
      '',
      data.get('problem') || ''
    ];
    summary.value = lines.join('\n');
    fallback.hidden = false;
    fallback.focus();
  }
})();
