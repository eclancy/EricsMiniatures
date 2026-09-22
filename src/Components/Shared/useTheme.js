import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ericsminiatures:theme';

/** Read the saved choice, if the visitor has made one. */
function storedTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    // Private browsing and blocked site data both throw here.
    return null;
  }
}

function systemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Light/dark theme with a remembered preference.
 *
 * Until the visitor chooses, the site follows the operating system and keeps
 * following it if they change that setting. Choosing pins it, and the choice
 * survives reloads. The chosen theme is written to data-theme on <html> so the
 * stylesheets can key off it, and to color-scheme so form controls and
 * scrollbars match.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => storedTheme() || systemTheme());
  // Whether the visitor has overridden the system preference.
  const [pinned, setPinned] = useState(() => storedTheme() !== null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }, [theme]);

  // Follow the OS while the visitor has not chosen for themselves.
  useEffect(() => {
    if (pinned) return undefined;

    let query;
    try {
      query = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return undefined;
    }

    const onChange = (event) => setTheme(event.matches ? 'dark' : 'light');
    // Safari before 14 only has the deprecated addListener.
    if (query.addEventListener) query.addEventListener('change', onChange);
    else query.addListener(onChange);

    return () => {
      if (query.removeEventListener) query.removeEventListener('change', onChange);
      else query.removeListener(onChange);
    };
  }, [pinned]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Not being able to remember the choice should not break the toggle.
      }
      return next;
    });
    setPinned(true);
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
