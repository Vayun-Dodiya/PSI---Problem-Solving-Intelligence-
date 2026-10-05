/**
 * PSI V3 — Shared UI primitives
 * Selects, toasts, auto-grow textarea, segmented controls, etc.
 */
(function (global) {
  const PSI = global.PSI || (global.PSI = {});

  /* ---------- Toast ---------- */

  function ensureToastRegion() {
    let region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(region);
    }
    return region;
  }

  function toast(message, { type = 'info', duration = 4200 } = {}) {
    const region = ensureToastRegion();
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <p class="toast__message"></p>
      <button type="button" class="toast__close" aria-label="Dismiss">×</button>
    `;
    el.querySelector('.toast__message').textContent = message;

    const remove = () => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 220);
    };

    el.querySelector('.toast__close').addEventListener('click', remove);
    region.appendChild(el);
    if (duration > 0) setTimeout(remove, duration);
    return el;
  }

  /* ---------- Custom Select ---------- */

  function initSelect(root) {
    if (!root || root.dataset.selectReady) return;
    root.dataset.selectReady = 'true';

    const trigger = root.querySelector('.select__trigger');
    const menu = root.querySelector('.select__menu');
    const valueEl = root.querySelector('.select__value');
    const input = root.querySelector('input[type="hidden"]');
    const options = Array.from(root.querySelectorAll('.select__option'));

    if (!trigger || !menu) return;

    let open = false;
    let highlight = Math.max(
      0,
      options.findIndex((o) => o.classList.contains('is-selected'))
    );

    function setOpen(next) {
      open = next;
      root.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        highlightOptions();
        const selected = options[highlight];
        if (selected) selected.focus({ preventScroll: true });
      }
    }

    function highlightOptions() {
      options.forEach((o, i) => {
        o.classList.toggle('is-highlighted', i === highlight);
        o.tabIndex = -1;
      });
    }

    function selectOption(option) {
      options.forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      const value = option.dataset.value;
      const label = option.textContent.trim();
      if (valueEl) valueEl.textContent = label;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      root.dispatchEvent(
        new CustomEvent('psi:select', { detail: { value, label }, bubbles: true })
      );
      setOpen(false);
      trigger.focus();
    }

    trigger.addEventListener('click', () => setOpen(!open));

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener('click', () => selectOption(option));
      option.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          highlight = Math.min(options.length - 1, highlight + 1);
          highlightOptions();
          options[highlight].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          highlight = Math.max(0, highlight - 1);
          highlightOptions();
          options[highlight].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(option);
        } else if (e.key === 'Escape') {
          setOpen(false);
          trigger.focus();
        }
      });
      option.addEventListener('mouseenter', () => {
        highlight = index;
        highlightOptions();
      });
    });

    document.addEventListener('click', (e) => {
      if (open && !root.contains(e.target)) setOpen(false);
    });
  }

  function initAllSelects(scope = document) {
    scope.querySelectorAll('.select').forEach(initSelect);
  }

  function getSelectValue(root) {
    const input = root.querySelector('input[type="hidden"]');
    return input ? input.value : null;
  }

  function setSelectValue(root, value) {
    const option = root.querySelector(`.select__option[data-value="${CSS.escape(value)}"]`);
    if (!option) return;
    option.click();
  }

  /* ---------- Segmented control ---------- */

  function initSegmented(root) {
    if (!root || root.dataset.segmentReady) return;
    root.dataset.segmentReady = 'true';

    const buttons = Array.from(root.querySelectorAll('.segmented__btn'));
    const name = root.dataset.name;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        root.dispatchEvent(
          new CustomEvent('psi:segment', {
            detail: { name, value: btn.dataset.value },
            bubbles: true,
          })
        );
      });
    });
  }

  function initAllSegmented(scope = document) {
    scope.querySelectorAll('.segmented').forEach(initSegmented);
  }

  function getSegmentValue(root) {
    const active = root.querySelector('.segmented__btn.is-active');
    return active ? active.dataset.value : null;
  }

  /* ---------- Auto-grow textarea ---------- */

  function autoGrow(textarea) {
    if (!textarea) return;
    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    textarea.addEventListener('input', resize);
    resize();
  }

  function initAutoGrow(scope = document) {
    scope.querySelectorAll('.textarea--auto').forEach(autoGrow);
  }

  /* ---------- Character count ---------- */

  function bindCharCount(textarea, counter, max) {
    if (!textarea || !counter) return;
    const update = () => {
      const len = textarea.value.length;
      counter.textContent = max ? `${len} / ${max}` : String(len);
      counter.classList.toggle('is-warn', max && len > max * 0.9);
      counter.classList.toggle('is-error', max && len > max);
    };
    textarea.addEventListener('input', update);
    update();
  }

  /* ---------- Mode selector ---------- */

  function isModeCardAvailable(card) {
    if (!card) return false;
    if (card.disabled || card.getAttribute('aria-disabled') === 'true') return false;
    if (card.classList.contains('is-unavailable')) return false;
    if (card.dataset.available === 'false') return false;
    return true;
  }

  function initModeSelector(root, { onChange } = {}) {
    if (!root || root.dataset.modeReady) return;
    root.dataset.modeReady = 'true';

    const cards = Array.from(root.querySelectorAll('.mode-card'));

    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!isModeCardAvailable(card)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        cards.forEach((c) => {
          if (!isModeCardAvailable(c)) return;
          c.classList.remove('is-selected');
          c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        const value = card.dataset.mode;
        if (typeof onChange === 'function') onChange(value);
        root.dispatchEvent(
          new CustomEvent('psi:mode', { detail: { mode: value }, bubbles: true })
        );
      });

      card.addEventListener('keydown', (e) => {
        if (!isModeCardAvailable(card)) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      });
    });
  }

  function getSelectedMode(root) {
    const selected = root.querySelector('.mode-card.is-selected');
    if (!selected || !isModeCardAvailable(selected)) return null;
    return selected.dataset.mode || null;
  }

  /* ---------- Analysis progress ---------- */

  const DEFAULT_STEPS = [
    'Problem received',
    'Understanding problem',
    'Identifying key concepts',
    'Evaluating approach',
    'Preparing solution',
  ];

  function renderAnalysisProgress(container, { steps = DEFAULT_STEPS } = {}) {
    if (!container) return { update() {}, complete() {}, destroy() {} };

    container.innerHTML = `
      <div class="analysis-progress" role="status" aria-live="polite">
        <div class="analysis-progress__header">
          <div class="analysis-progress__label">PSI is working through your problem</div>
          <div class="analysis-progress__sub">High-level progress · not model chain-of-thought</div>
        </div>
        <div class="analysis-progress__track">
          <div class="analysis-progress__bar" style="width: 8%"></div>
        </div>
        <ol class="analysis-progress__steps">
          ${steps
            .map(
              (label, i) => `
            <li class="analysis-progress__step" data-step="${i}">
              <span class="analysis-progress__marker" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
              <span>${label}</span>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    `;

    const bar = container.querySelector('.analysis-progress__bar');
    const stepEls = Array.from(container.querySelectorAll('.analysis-progress__step'));
    let current = 0;
    let timer = null;

    function paint() {
      stepEls.forEach((el, i) => {
        el.classList.toggle('is-done', i < current);
        el.classList.toggle('is-current', i === current);
      });
      const pct = Math.min(96, ((current + 0.35) / steps.length) * 100);
      if (bar) bar.style.width = `${pct}%`;
    }

    function start() {
      current = 0;
      paint();
      clearInterval(timer);
      timer = setInterval(() => {
        if (current < steps.length - 1) {
          current += 1;
          paint();
        }
      }, 900);
    }

    function complete() {
      clearInterval(timer);
      current = steps.length;
      stepEls.forEach((el) => {
        el.classList.add('is-done');
        el.classList.remove('is-current');
      });
      if (bar) bar.style.width = '100%';
    }

    function destroy() {
      clearInterval(timer);
      container.innerHTML = '';
    }

    start();
    return { update: paint, complete, destroy };
  }

  /* ---------- Analysis result renderer ---------- */

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function section(index, title, bodyHtml) {
    if (!bodyHtml) return '';
    return `
      <article class="analysis-section">
        <header class="analysis-section__header">
          <span class="analysis-section__index">${index}</span>
          <h3 class="analysis-section__title">${escapeHtml(title)}</h3>
        </header>
        <div class="analysis-section__body">${bodyHtml}</div>
      </article>
    `;
  }

  function renderAnalysisResult(container, mapped) {
    if (!container) return;

    if (!mapped || !mapped.success) {
      const msg =
        (mapped && mapped.error) ||
        'Something went wrong while analyzing this problem.';
      container.innerHTML = `
        <div class="state-block state-block--error">
          <div class="state-block__icon" aria-hidden="true">!</div>
          <h3 class="state-block__title">Analysis unavailable</h3>
          <p class="state-block__text">${escapeHtml(msg)}</p>
        </div>
      `;
      return;
    }

    const r = mapped.response || {};
    const parts = [];
    let n = 1;
    const idx = () => String(n++).padStart(2, '0');

    const understanding = r.problem_understanding || r.intent;
    if (understanding) {
      parts.push(section(idx(), 'Problem Understanding', `<p>${escapeHtml(understanding)}</p>`));
    }

    if (r.classification) {
      parts.push(
        section(
          idx(),
          'Problem Classification',
          `<p>${escapeHtml(r.classification)}</p>`
        )
      );
    }

    if (r.constraints) {
      parts.push(section(idx(), 'Constraints', `<p>${escapeHtml(r.constraints)}</p>`));
    }

    if (r.approach_summary) {
      parts.push(section(idx(), 'Approach', `<p>${escapeHtml(r.approach_summary)}</p>`));
    }

    if (r.mistake_identified) {
      parts.push(
        section(idx(), 'Mistake Identified', `<p>${escapeHtml(r.mistake_identified)}</p>`)
      );
    }

    if (r.why_incorrect) {
      parts.push(section(idx(), 'Why It Is Incorrect', `<p>${escapeHtml(r.why_incorrect)}</p>`));
    }

    if (r.misunderstood_concepts && r.misunderstood_concepts.length) {
      const chips = r.misunderstood_concepts
        .map((c) => `<span class="badge badge--ai">${escapeHtml(c)}</span>`)
        .join('');
      parts.push(
        section(idx(), 'Concepts', `<div class="concept-list">${chips}</div>`)
      );
    }

    if (r.hint) {
      parts.push(section(idx(), 'Hint', `<p>${escapeHtml(r.hint)}</p>`));
    }

    if (r.correct_code_provided && r.corrected_code) {
      parts.push(
        section(
          idx(),
          'Corrected Solution',
          `<div class="code-block">
            <div class="code-block__header"><span>corrected</span></div>
            <pre class="code-block__pre">${escapeHtml(r.corrected_code)}</pre>
          </div>`
        )
      );
    }

    if (typeof r.confidence === 'number') {
      const pct = Math.round(Math.max(0, Math.min(1, r.confidence)) * 100);
      parts.push(
        section(
          idx(),
          'Confidence',
          `<div class="confidence">
            <div class="confidence__meter" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Confidence">
              <div class="confidence__fill" style="width:${pct}%"></div>
            </div>
            <div class="confidence__value">${pct}%</div>
          </div>`
        )
      );
    }

    if (!parts.length) {
      container.innerHTML = `
        <div class="state-block">
          <div class="state-block__icon" aria-hidden="true">○</div>
          <h3 class="state-block__title">No structured fields returned</h3>
          <p class="state-block__text">The analysis completed, but there was nothing to display. Try refining the problem or code.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="analysis-sections">${parts.join('')}</div>`;
  }

  function renderEmptyAnalysis(container, message) {
    if (!container) return;
    container.innerHTML = `
      <div class="state-block">
        <div class="state-block__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M4 6h16M4 12h10M4 18h14"/>
          </svg>
        </div>
        <h3 class="state-block__title">Ready when you are</h3>
        <p class="state-block__text">${escapeHtml(
          message ||
            'Describe a problem and let PSI help you work through it.'
        )}</p>
      </div>
    `;
  }

  PSI.ui = {
    toast,
    initSelect,
    initAllSelects,
    getSelectValue,
    setSelectValue,
    initSegmented,
    initAllSegmented,
    getSegmentValue,
    autoGrow,
    initAutoGrow,
    bindCharCount,
    initModeSelector,
    getSelectedMode,
    renderAnalysisProgress,
    renderAnalysisResult,
    renderEmptyAnalysis,
    escapeHtml,
    ANALYSIS_STEPS: DEFAULT_STEPS,
  };
})(window);
