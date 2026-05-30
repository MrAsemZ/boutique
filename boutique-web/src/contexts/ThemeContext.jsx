import { createContext, useContext, useState, useCallback } from 'react';
import { getThemeForCategory } from '../themes/categoryThemes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = useCallback((themeName) => {
    setIsTransitioning(true);
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.style.transition =
      'background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease';

    if (themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    setCurrentTheme(themeName);

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 600);
  }, []);

  const setThemeForCategory = useCallback(
    (categorySlug) => {
      setTheme(getThemeForCategory(categorySlug));
    },
    [setTheme]
  );

  return (
    <ThemeContext.Provider value={{ currentTheme, isTransitioning, setTheme, setThemeForCategory }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
