/**
 * PSI V3 — Configuration
 * Override via window.__PSI_CONFIG__ or localStorage key `psi.apiBaseUrl`
 */
(function (global) {
  const defaults = {
    apiBaseUrl: '/api',
    analyzePath: '/analyze',
    profilePath: '/profile',
    requestTimeoutMs: 45000,
    useMock: false,
  };

  const stored = (() => {
    try {
      return localStorage.getItem('psi.apiBaseUrl');
    } catch {
      return null;
    }
  })();

  const runtime = global.__PSI_CONFIG__ || {};

  const config = {
    ...defaults,
    ...runtime,
    apiBaseUrl: stored || runtime.apiBaseUrl || defaults.apiBaseUrl,
  };

  // Enable mock only when explicitly set (dev), never silently in production paths
  if (runtime.useMock === true || global.__PSI_USE_MOCK__ === true) {
    config.useMock = true;
  }

  // Local file:// preview has no FastAPI — enable mock unless explicitly disabled
  try {
    if (
      global.location &&
      global.location.protocol === 'file:' &&
      runtime.useMock !== false
    ) {
      config.useMock = true;
    }
  } catch {
    /* ignore */
  }

  global.PSI = global.PSI || {};
  global.PSI.config = config;
})(window);
