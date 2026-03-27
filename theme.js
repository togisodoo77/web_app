// ============================================================
// theme.js — харанхуй горим (хуудсууд хооронд нэг маягт)
// ============================================================

const DARK_CLASS = 'dark-mode';
const ICON_SUN = '\u2600';
const ICON_MOON = '\u263e';
const STORAGE_KEY = 'amraltrent-dark';

/**
 * @param {string} [buttonId]
 */
export function initDarkModeToggle(buttonId = 'dark-toggle') {
  const btn = document.getElementById(buttonId);
  if (!btn) {
    return;
  }

  const apply = (isDark) => {
    document.body.classList.toggle(DARK_CLASS, isDark);
    btn.textContent = isDark ? ICON_SUN : ICON_MOON;
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      apply(saved === '1');
    }
  } catch (_) {
    /* ignore */
  }

  btn.onclick = () => {
    const next = !document.body.classList.contains(DARK_CLASS);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch (_) {
      /* ignore */
    }
  };
}
