/**
 * PSI V3 — Analyze workspace
 */
(function () {
  const PSI = window.PSI;
  if (!PSI || !PSI.api || !PSI.ui) return;

  const form = document.getElementById('analyze-form');
  const resultsEl = document.getElementById('analysis-results');
  const resultsPanel = document.getElementById('results-panel') || resultsEl?.closest('.results-panel');
  const resultsMeta = document.getElementById('results-meta');
  const submitBtn = document.getElementById('analyze-submit');
  const promptEl = document.getElementById('analyze-prompt');
  const codeEl = document.getElementById('analyze-code');
  const charCount = document.getElementById('analyze-char-count');
  const modeRoot = document.getElementById('mode-selector');
  const langSelect = document.getElementById('language-select');
  const flowStrip = document.getElementById('flow-strip');
  const editorLangLabel = document.getElementById('editor-lang-label');

  const PSI_MODES = [
    {
      id: 'code_checker',
      name: 'Code Analysis',
      description: 'Analyze your code, understand mistakes, and improve your approach.',
      available: true,
      needsCode: true,
    },
    {
      id: 'learn_mistakes',
      name: 'Learn Through Mistakes',
      description: 'Understand misconceptions and learn from incorrect attempts.',
      available: false,
      needsCode: true,
    },
    {
      id: 'solution_builder',
      name: 'Solution Builder',
      description: 'Build structured solutions from problems and constraints.',
      available: false,
      needsCode: false,
    },
    {
      id: 'practice',
      name: 'Practice & Error Finder',
      description: 'Practice problem-solving and identify weaknesses in your approach.',
      available: false,
      needsCode: true,
    },
  ];

  const MODES = PSI_MODES.reduce((acc, mode) => {
    acc[mode.id] = mode;
    return acc;
  }, {});

  const DEFAULT_MODE_ID = 'code_checker';
  const SUBMIT_LABEL = 'Analyze Problem';

  let busy = false;
  let progressCtrl = null;

  function renderModeSelector(root) {
    if (!root) return;

    root.innerHTML = PSI_MODES.map((mode, index) => {
      const num = String(index + 1).padStart(2, '0');
      const available = Boolean(mode.available);
      const selected = available && mode.id === DEFAULT_MODE_ID;
      const status = available ? 'Available' : 'Coming Soon';
      const disabledAttrs = available
        ? `aria-pressed="${selected ? 'true' : 'false'}"`
        : 'disabled aria-disabled="true" tabindex="-1"';

      return `
        <button
          type="button"
          class="mode-card${selected ? ' is-selected' : ''}${available ? '' : ' is-unavailable'}"
          data-mode="${PSI.ui.escapeHtml(mode.id)}"
          data-available="${available ? 'true' : 'false'}"
          ${disabledAttrs}
        >
          <span class="mode-card__id">Mode ${num}</span>
          <span class="mode-card__name">${PSI.ui.escapeHtml(mode.name)}</span>
          <span class="mode-card__desc">${PSI.ui.escapeHtml(mode.description)}</span>
          <span class="mode-card__status">${status}</span>
        </button>
      `;
    }).join('');
  }

  function getActiveModeId() {
    const selected = modeRoot && PSI.ui.getSelectedMode(modeRoot);
    if (selected && MODES[selected] && MODES[selected].available) {
      return selected;
    }
    return DEFAULT_MODE_ID;
  }

  function getFormData() {
    return {
      prompt: (promptEl && promptEl.value.trim()) || '',
      code: (codeEl && codeEl.value) || '',
      mode: getActiveModeId(),
      language: (langSelect && PSI.ui.getSelectValue(langSelect)) || 'python',
      constraints: collectConstraints(),
    };
  }

  function validateInput({ prompt, code, mode }) {
    const modeMeta = MODES[mode] || MODES[DEFAULT_MODE_ID];

    if (!modeMeta || !modeMeta.available) {
      return {
        ok: false,
        message: 'That mode is coming soon. Code Analysis is available now.',
      };
    }

    if (!prompt) {
      if (promptEl) {
        promptEl.classList.add('is-error');
        promptEl.focus();
      }
      return {
        ok: false,
        message: 'Add a problem or question before starting analysis.',
      };
    }

    if (modeMeta.needsCode && !String(code).trim()) {
      if (codeEl) codeEl.focus();
      return {
        ok: false,
        message: 'Paste your attempted code before starting Code Analysis.',
      };
    }

    return { ok: true, modeMeta };
  }

  function setFlow(stage) {
    if (!flowStrip) return;
    const order = ['input', 'thinking', 'solution'];
    const idx = order.indexOf(stage);
    flowStrip.querySelectorAll('.flow-strip__item').forEach((el) => {
      const key = el.dataset.flow;
      const i = order.indexOf(key);
      el.classList.toggle('is-active', key === stage);
      el.classList.toggle('is-done', i < idx);
    });
  }

  function syncEditorLabel() {
    if (!langSelect || !editorLangLabel) return;
    const val = PSI.ui.getSelectValue(langSelect) || 'python';
    editorLangLabel.textContent = val;
  }

  function applySegment(root, value) {
    if (!root || !value) return;
    const btn = root.querySelector(`.segmented__btn[data-value="${value}"]`);
    if (btn) btn.click();
  }

  function loadPendingFromHome() {
    try {
      const raw = sessionStorage.getItem('psi.pendingAnalyze');
      if (!raw) return;
      sessionStorage.removeItem('psi.pendingAnalyze');
      const data = JSON.parse(raw);
      if (data.prompt && promptEl) {
        promptEl.value = data.prompt;
        promptEl.dispatchEvent(new Event('input'));
      }
      if (data.constraints) {
        applySegment(document.getElementById('analyze-skill'), data.constraints.skill_level);
        applySegment(document.getElementById('analyze-time'), data.constraints.time_constraint);
        applySegment(document.getElementById('analyze-budget'), data.constraints.budget);
      }
    } catch {
      /* ignore */
    }
  }

  function collectConstraints() {
    const skill = document.getElementById('analyze-skill');
    const time = document.getElementById('analyze-time');
    const budget = document.getElementById('analyze-budget');
    return {
      skill_level: skill ? PSI.ui.getSegmentValue(skill) : null,
      time_constraint: time ? PSI.ui.getSegmentValue(time) : null,
      budget: budget ? PSI.ui.getSegmentValue(budget) : null,
    };
  }

  function setLoadingState(next) {
    busy = next;

    if (resultsEl) {
      resultsEl.setAttribute('aria-busy', next ? 'true' : 'false');
    }

    if (submitBtn) {
      submitBtn.disabled = next;
      submitBtn.setAttribute('aria-disabled', String(next));
      submitBtn.innerHTML = next
        ? '<span class="btn__spinner" aria-hidden="true"></span> Analyzing…'
        : SUBMIT_LABEL;
    }

    if (promptEl) promptEl.disabled = next;
    if (codeEl) codeEl.disabled = next;

    const langTrigger = langSelect && langSelect.querySelector('.select__trigger');
    if (langTrigger) langTrigger.disabled = next;

    document.querySelectorAll('#analyze-skill .segmented__btn, #analyze-time .segmented__btn, #analyze-budget .segmented__btn')
      .forEach((btn) => {
        btn.disabled = next;
      });
  }

  function showResultsMeta(mapped) {
    if (!resultsMeta) return;
    if (!mapped || !mapped.success) {
      resultsMeta.innerHTML = '';
      return;
    }
    const mode = MODES[mapped.mode] || { name: mapped.mode || 'Analysis' };
    const conf =
      mapped.response && typeof mapped.response.confidence === 'number'
        ? Math.round(mapped.response.confidence * 100) + '%'
        : null;

    resultsMeta.innerHTML = `
      <span class="badge badge--primary">${PSI.ui.escapeHtml(mode.name)}</span>
      ${conf ? `<span class="badge">${PSI.ui.escapeHtml(conf)} confidence</span>` : ''}
    `;
  }

  function revealResults() {
    const target = resultsPanel || resultsEl;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showErrorState(title, message) {
    if (!resultsEl) return;
    resultsEl.innerHTML = `
      <div class="state-block state-block--error">
        <div class="state-block__icon" aria-hidden="true">!</div>
        <h3 class="state-block__title">${PSI.ui.escapeHtml(title)}</h3>
        <p class="state-block__text">${PSI.ui.escapeHtml(message)}</p>
        <button type="button" class="btn btn--secondary mt-4" id="retry-analyze">Try again</button>
      </div>
    `;
    const retry = document.getElementById('retry-analyze');
    if (retry) retry.addEventListener('click', analyzeProblem);
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function analyzeProblem() {
    if (busy) return;

    const data = getFormData();
    const validation = validateInput(data);
    if (!validation.ok) {
      PSI.ui.toast(validation.message, { type: 'warning' });
      return;
    }

    if (promptEl) promptEl.classList.remove('is-error');

    setLoadingState(true);
    setFlow('thinking');
    showResultsMeta(null);

    if (resultsEl) {
      resultsEl.innerHTML = '';
      progressCtrl = PSI.ui.renderAnalysisProgress(resultsEl);
      revealResults();
    }

    try {
      const result = await PSI.api.analyzeProblem({
        language: data.language,
        attempted_code: data.code,
        prompt: data.prompt,
        mode: data.mode,
        constraints: data.constraints,
      });

      if (progressCtrl) progressCtrl.complete();
      await delay(280);

      if (!result.success) {
        setFlow('input');
        PSI.ui.renderAnalysisResult(resultsEl, result);
        showResultsMeta(result);
        revealResults();
        PSI.ui.toast(
          result.error || 'Something went wrong while analyzing this problem.',
          { type: 'error' }
        );
        return;
      }

      setFlow('solution');
      PSI.ui.renderAnalysisResult(resultsEl, result);
      showResultsMeta(result);
      revealResults();
      PSI.ui.toast('Analysis complete.', { type: 'success', duration: 2800 });
    } catch (err) {
      if (progressCtrl) progressCtrl.destroy();
      setFlow('input');

      const message =
        (err && err.message) ||
        "PSI couldn't connect to the analysis service. Check your connection and try again.";
      const title =
        err && err.code === 'timeout' ? 'Request timed out' : 'Connection error';

      showErrorState(title, message);
      revealResults();
      PSI.ui.toast(message, { type: 'error' });
    } finally {
      setLoadingState(false);
      progressCtrl = null;
    }
  }

  function enableMockFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mock') === '1') {
        PSI.config.useMock = true;
        PSI.ui.toast('Mock analysis mode enabled for this page.', {
          type: 'info',
          duration: 3200,
        });
      }
    } catch {
      /* ignore */
    }
  }

  function bindEvents() {
    if (langSelect) {
      langSelect.addEventListener('psi:select', syncEditorLabel);
      syncEditorLabel();
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        analyzeProblem();
      });
    }

    const onCmdEnter = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeProblem();
      }
    };

    if (promptEl) {
      promptEl.addEventListener('keydown', onCmdEnter);
      promptEl.addEventListener('input', () => promptEl.classList.remove('is-error'));
    }

    if (codeEl) {
      codeEl.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = codeEl.selectionStart;
          const end = codeEl.selectionEnd;
          codeEl.value =
            codeEl.value.substring(0, start) + '  ' + codeEl.value.substring(end);
          codeEl.selectionStart = codeEl.selectionEnd = start + 2;
        }
        onCmdEnter(e);
      });
    }
  }

  // Boot
  PSI.ui.renderEmptyAnalysis(resultsEl);
  setFlow('input');

  if (promptEl && charCount) {
    PSI.ui.bindCharCount(promptEl, charCount, 4000);
  }

  if (modeRoot) {
    renderModeSelector(modeRoot);
    PSI.ui.initModeSelector(modeRoot);
  }

  loadPendingFromHome();
  bindEvents();
  enableMockFromQuery();
})();
