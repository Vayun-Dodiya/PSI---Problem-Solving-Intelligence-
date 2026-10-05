/**
 * PSI V3 — API Service Layer
 * UI → API Service → FastAPI → AI Service
 *
 * Keep fetch / mapping here. Do not put AI logic in the frontend.
 */
(function (global) {
  const PSI = global.PSI || (global.PSI = {});

  class ApiError extends Error {
    constructor(message, { status = 0, code = 'unknown', details = null } = {}) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.details = details;
    }
  }

  function getBaseUrl() {
    return (PSI.config && PSI.config.apiBaseUrl) || '/api';
  }

  function joinUrl(base, path) {
    const b = String(base || '').replace(/\/+$/, '');
    const p = String(path || '').replace(/^\/+/, '');
    return `${b}/${p}`;
  }

  /**
   * Normalize backend analyze response into a stable UI model.
   * Missing fields must not crash the UI.
   */
  function mapAnalyzeResponse(raw) {
    const data = raw && typeof raw === 'object' ? raw : {};
    const response = data.response && typeof data.response === 'object' ? data.response : {};

    return {
      success: Boolean(data.success),
      mode: data.mode || null,
      error: data.error || null,
      response: {
        intent: response.intent ?? null,
        approach_summary: response.approach_summary ?? null,
        mistake_identified: response.mistake_identified ?? null,
        why_incorrect: response.why_incorrect ?? null,
        misunderstood_concepts: Array.isArray(response.misunderstood_concepts)
          ? response.misunderstood_concepts
          : [],
        hint: response.hint ?? null,
        correct_code_provided: Boolean(response.correct_code_provided),
        corrected_code: response.corrected_code ?? null,
        confidence:
          typeof response.confidence === 'number' ? response.confidence : null,
        // Optional future fields — passthrough safely
        classification: response.classification ?? null,
        constraints: response.constraints ?? null,
        problem_understanding: response.problem_understanding ?? response.intent ?? null,
      },
    };
  }

  /**
   * Build request body compatible with current FastAPI contract.
   */
  function buildAnalyzePayload({
    language,
    attempted_code,
    code,
    prompt,
    mode,
    constraints,
  } = {}) {
    const payload = {
      language: language || 'python',
      attempted_code: attempted_code != null ? attempted_code : code || '',
      prompt: prompt || '',
      mode: mode || 'code_checker',
    };

    if (constraints && typeof constraints === 'object') {
      payload.constraints = constraints;
    }

    return payload;
  }

  async function request(path, options = {}) {
    const timeoutMs =
      options.timeoutMs != null
        ? options.timeoutMs
        : (PSI.config && PSI.config.requestTimeoutMs) || 45000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = joinUrl(getBaseUrl(), path);
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body != null ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: options.credentials || 'same-origin',
      });

      let json = null;
      const text = await res.text();
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }

      if (!res.ok) {
        throw new ApiError(extractErrorMessage(json, res.status), {
          status: res.status,
          code: 'http_error',
          details: json,
        });
      }

      return json;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError(
          'The analysis request timed out. Please try again.',
          { code: 'timeout' }
        );
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        "PSI couldn't connect to the analysis service. Check your connection and try again.",
        { code: 'network', details: err && err.message }
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /** Prefer user-facing strings; never surface FastAPI validation dumps raw. */
  function extractErrorMessage(json, status) {
    if (!json || typeof json !== 'object') {
      return `Request failed (${status})`;
    }

    const candidates = [json.error, json.message, json.detail];
    for (const value of candidates) {
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (Array.isArray(value) && value.length) {
        const first = value[0];
        if (typeof first === 'string' && first.trim()) return first.trim();
        if (first && typeof first.msg === 'string' && first.msg.trim()) {
          return first.msg.trim();
        }
      }
    }

    return 'Something went wrong while contacting PSI.';
  }

  /* ---------- Mock layer (dev only; clearly isolated) ---------- */

  const MOCK_ANALYZE = {
    success: true,
    mode: 'code_checker',
    response: {
      intent: 'Find and fix a logic error in a function that should return the maximum of two numbers.',
      approach_summary:
        'Compare both inputs with a conditional and return the larger value. Watch for off-by-one style mistakes when using strict inequalities.',
      mistake_identified: 'The comparison uses `>` but returns `b` when `a` is greater, swapping the result.',
      why_incorrect:
        'When `a > b` is true, the function returns `b`, which is the smaller value. The branch bodies are inverted relative to the condition.',
      misunderstood_concepts: ['Conditional branching', 'Return values', 'Comparison operators'],
      hint: 'Trace the function with a=5, b=3. Which branch runs, and what does it return?',
      correct_code_provided: true,
      corrected_code:
        'def max_of_two(a, b):\n    if a > b:\n        return a\n    return b\n',
      confidence: 0.92,
      classification: 'Programming · Control Flow',
      constraints: 'Language: Python · Mode: Code Analysis',
    },
    error: null,
  };

  const MOCK_PROFILE = {
    name: 'Learner',
    skill_level: 'intermediate',
    problems_analyzed: 24,
    problems_solved: 17,
    learning_progress: 0.68,
    common_mistakes: [
      { category: 'Off-by-one errors', count: 6 },
      { category: 'Null / undefined checks', count: 4 },
      { category: 'Loop invariants', count: 3 },
      { category: 'Type mismatches', count: 2 },
    ],
    recent_activity: [
      {
        title: 'Fixed max_of_two comparison bug',
        mode: 'code_checker',
        language: 'python',
        at: '2026-09-14T10:22:00Z',
      },
      {
        title: 'SQL join condition review',
        mode: 'learn_mistakes',
        language: 'sql',
        at: '2026-09-13T18:05:00Z',
      },
      {
        title: 'Binary search boundary practice',
        mode: 'practice',
        language: 'javascript',
        at: '2026-09-12T09:41:00Z',
      },
    ],
  };

  async function analyzeProblem(input) {
    const payload = buildAnalyzePayload(input);

    if (PSI.config && PSI.config.useMock) {
      await delay(1800);
      return mapAnalyzeResponse({ ...MOCK_ANALYZE, mode: payload.mode });
    }

    const path = (PSI.config && PSI.config.analyzePath) || '/analyze';
    const raw = await request(path, { method: 'POST', body: payload });
    return mapAnalyzeResponse(raw);
  }

  async function getProfile() {
    if (PSI.config && PSI.config.useMock) {
      await delay(400);
      return { ...MOCK_PROFILE };
    }

    const path = (PSI.config && PSI.config.profilePath) || '/profile';
    try {
      return await request(path, { method: 'GET' });
    } catch (err) {
      // Profile may not exist yet — surface empty-compatible shape
      if (err.code === 'network' || err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  PSI.api = {
    ApiError,
    analyzeProblem,
    getProfile,
    mapAnalyzeResponse,
    buildAnalyzePayload,
    request,
    /* Exposed for tests / switching — never mix into production UI */
    __mock: {
      analyze: MOCK_ANALYZE,
      profile: MOCK_PROFILE,
    },
  };
})(window);
