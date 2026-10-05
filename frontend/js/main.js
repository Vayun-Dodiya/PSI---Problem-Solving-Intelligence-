/**
 * PSI V3 — Shared bootstrap (navbar, footer year, global UI)
 */
(function (global) {
  const PSI = global.PSI || (global.PSI = {});

  function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const toggle = nav.querySelector('.navbar__toggle');
    const closeMenu = () => {
      nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    };

    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    nav.querySelectorAll('.navbar__link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        if (toggle) toggle.focus();
      }
    });

    const page = document.body.dataset.page;
    if (page) {
      nav.querySelectorAll('.navbar__link').forEach((link) => {
        const target = link.dataset.nav;
        link.classList.toggle('is-active', target === page);
        if (target === page) link.setAttribute('aria-current', 'page');
      });
    }
  }

  function initFooterYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function boot() {
    initNavbar();
    initFooterYear();
    if (PSI.ui) {
      PSI.ui.initAllSelects();
      PSI.ui.initAllSegmented();
      PSI.ui.initAutoGrow();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  PSI.main = { initNavbar, boot };
})(window);
