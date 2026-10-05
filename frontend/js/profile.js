/**
 * PSI V3 — Profile page
 */
(function () {
  const PSI = window.PSI;
  if (!PSI || !PSI.api || !PSI.ui) return;

  const root = document.getElementById('profile-root');
  if (!root) return;

  const FALLBACK = {
    name: 'Guest Learner',
    skill_level: 'intermediate',
    problems_analyzed: 0,
    problems_solved: 0,
    learning_progress: 0,
    common_mistakes: [],
    recent_activity: [],
  };

  function formatRelative(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }

  function skillLabel(value) {
    const map = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return map[value] || value || '—';
  }

  function initials(name) {
    return String(name || 'P')
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function render(profile, { fromApi }) {
    const p = { ...FALLBACK, ...(profile || {}) };
    const progress = Math.round(
      Math.max(0, Math.min(1, Number(p.learning_progress) || 0)) * 100
    );

    const mistakes = (p.common_mistakes || []).slice(0, 6);
    const maxMistake = Math.max(1, ...mistakes.map((m) => m.count || 0));

    const activity = p.recent_activity || [];

    root.innerHTML = `
      <div class="profile__header">
        <div class="profile__identity">
          <div class="profile__avatar" aria-hidden="true">${PSI.ui.escapeHtml(
            initials(p.name)
          )}</div>
          <div>
            <h1 class="profile__name">${PSI.ui.escapeHtml(p.name)}</h1>
            <div class="profile__meta">
              <span class="badge badge--primary">${PSI.ui.escapeHtml(
                skillLabel(p.skill_level)
              )}</span>
              <span>${fromApi ? 'Synced with PSI' : 'Local preview · connect profile API later'}</span>
            </div>
          </div>
        </div>
        <a class="btn btn--primary" href="/analyze">Analyze a problem</a>
      </div>

      <div class="stat-row">
        <div class="stat">
          <div class="stat__label">Problems analyzed</div>
          <div class="stat__value">${Number(p.problems_analyzed) || 0}</div>
          <div class="stat__hint">Total submissions</div>
        </div>
        <div class="stat">
          <div class="stat__label">Problems solved</div>
          <div class="stat__value">${Number(p.problems_solved) || 0}</div>
          <div class="stat__hint">Marked complete</div>
        </div>
        <div class="stat">
          <div class="stat__label">Learning progress</div>
          <div class="stat__value">${progress}%</div>
          <div class="progress-bar" role="meter" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="Learning progress">
            <div class="progress-bar__fill" style="width:${progress}%"></div>
          </div>
        </div>
      </div>

      <div class="profile__grid">
        <section class="panel">
          <header class="panel__header">
            <h2 class="panel__title">Recent activity</h2>
          </header>
          <div class="panel__body">
            ${
              activity.length
                ? `<div class="activity-list">
                    ${activity
                      .map(
                        (item) => `
                      <article class="activity-item">
                        <span class="activity-item__dot" aria-hidden="true"></span>
                        <div>
                          <div class="activity-item__title">${PSI.ui.escapeHtml(
                            item.title || 'Analysis'
                          )}</div>
                          <div class="activity-item__meta">${PSI.ui.escapeHtml(
                            [item.mode, item.language].filter(Boolean).join(' · ')
                          )}</div>
                        </div>
                        <time class="activity-item__time">${PSI.ui.escapeHtml(
                          formatRelative(item.at)
                        )}</time>
                      </article>`
                      )
                      .join('')}
                  </div>`
                : `<div class="state-block" style="padding:2rem 1rem">
                    <h3 class="state-block__title">No activity yet</h3>
                    <p class="state-block__text">Your recent analyses will show up here as you work through problems.</p>
                  </div>`
            }
          </div>
        </section>

        <aside class="flex flex-col gap-4">
          <section class="panel">
            <header class="panel__header">
              <h2 class="panel__title">Skill level</h2>
            </header>
            <div class="panel__body skill-select-row">
              <p class="text-sm text-muted">Helps PSI tune explanations and hints.</p>
              <div class="segmented" id="profile-skill" data-name="skill" role="group" aria-label="Skill level">
                <button type="button" class="segmented__btn${
                  p.skill_level === 'beginner' ? ' is-active' : ''
                }" data-value="beginner" aria-pressed="${
      p.skill_level === 'beginner'
    }">Beginner</button>
                <button type="button" class="segmented__btn${
                  p.skill_level === 'intermediate' ? ' is-active' : ''
                }" data-value="intermediate" aria-pressed="${
      p.skill_level === 'intermediate'
    }">Intermediate</button>
                <button type="button" class="segmented__btn${
                  p.skill_level === 'advanced' ? ' is-active' : ''
                }" data-value="advanced" aria-pressed="${
      p.skill_level === 'advanced'
    }">Advanced</button>
              </div>
            </div>
          </section>

          <section class="panel">
            <header class="panel__header">
              <h2 class="panel__title">Common mistake patterns</h2>
            </header>
            <div class="panel__body">
              ${
                mistakes.length
                  ? `<div class="mistake-list">
                      ${mistakes
                        .map(
                          (m) => `
                        <div class="mistake-item">
                          <span class="mistake-item__label">${PSI.ui.escapeHtml(
                            m.category
                          )}</span>
                          <div class="mistake-item__bar-wrap" aria-hidden="true">
                            <div class="mistake-item__bar" style="width:${Math.round(
                              ((m.count || 0) / maxMistake) * 100
                            )}%"></div>
                          </div>
                          <span class="mistake-item__count">${Number(m.count) || 0}</span>
                        </div>`
                        )
                        .join('')}
                    </div>`
                  : `<p class="text-sm text-muted">Mistake categories will appear after you run analyses with Learn Through Mistakes.</p>`
              }
            </div>
          </section>
        </aside>
      </div>
    `;

    const skillSeg = document.getElementById('profile-skill');
    if (skillSeg) {
      PSI.ui.initSegmented(skillSeg);
      skillSeg.addEventListener('psi:segment', (e) => {
        try {
          localStorage.setItem('psi.skillLevel', e.detail.value);
        } catch {
          /* ignore */
        }
        PSI.ui.toast(`Skill level set to ${skillLabel(e.detail.value)}.`, {
          type: 'success',
          duration: 2200,
        });
      });
    }
  }

  async function load() {
    root.innerHTML = `
      <div class="state-block">
        <div class="state-block__icon" aria-hidden="true">
          <span class="btn__spinner" style="border-color:rgba(74,144,226,.3);border-top-color:var(--psi-primary)"></span>
        </div>
        <h3 class="state-block__title">Loading profile</h3>
        <p class="state-block__text">Fetching your learning data…</p>
      </div>
    `;

    // Dev mock flag
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mock') === '1') {
        PSI.config.useMock = true;
      }
    } catch {
      /* ignore */
    }

    try {
      const data = await PSI.api.getProfile();
      if (data) {
        render(data, { fromApi: true });
        return;
      }
    } catch (err) {
      PSI.ui.toast(
        err.message || 'Could not load profile. Showing a local preview.',
        { type: 'warning' }
      );
    }

    // Empty-compatible local preview (not fake production AI)
    let skill = 'intermediate';
    try {
      skill = localStorage.getItem('psi.skillLevel') || skill;
    } catch {
      /* ignore */
    }

    render(
      {
        ...FALLBACK,
        skill_level: skill,
      },
      { fromApi: false }
    );
  }

  load();
})();
