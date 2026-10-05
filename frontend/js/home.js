/**
 * PSI V3 — Home page interactions
 * Hero problem input → Analyze with session handoff
 */
(function () {
  const form = document.getElementById('hero-problem-form');
  if (!form || !window.PSI || !PSI.ui) return;

  const textarea = document.getElementById('hero-problem');
  const charCount = document.getElementById('hero-char-count');
  const submitBtn = document.getElementById('hero-analyze-btn');
  const MAX = 4000;

  if (textarea && charCount) {
    PSI.ui.bindCharCount(textarea, charCount, MAX);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn && submitBtn.disabled) return;

    const prompt = (textarea && textarea.value.trim()) || '';
    if (!prompt) {
      if (textarea) {
        textarea.classList.add('is-error');
        textarea.focus();
      }
      PSI.ui.toast('Add a problem or question before starting analysis.', {
        type: 'warning',
      });
      return;
    }

    if (textarea) textarea.classList.remove('is-error');

    const skill = document.getElementById('hero-skill');
    const time = document.getElementById('hero-time');
    const budget = document.getElementById('hero-budget');

    const payload = {
      prompt,
      constraints: {
        skill_level: skill ? PSI.ui.getSegmentValue(skill) : 'intermediate',
        time_constraint: time ? PSI.ui.getSegmentValue(time) : 'flexible',
        budget: budget ? PSI.ui.getSegmentValue(budget) : 'none',
      },
      source: 'home',
    };

    try {
      sessionStorage.setItem('psi.pendingAnalyze', JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Opening…';
    }

    window.location.href = '/analyze';
  });

  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.classList.remove('is-error');
    });

    textarea.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        form.requestSubmit();
      }
    });
  }
})();
