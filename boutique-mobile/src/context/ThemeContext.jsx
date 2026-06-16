import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { themes, getThemeForCategory } from '../theme/colors';

const ThemeContext = createContext({
  theme: themes.default,
  setThemeForCategory: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.default);

  const setThemeForCategory = useCallback((slug) => {
    setTheme(getThemeForCategory(slug || ''));
  }, []);

  const value = useMemo(
    () => ({ theme, setThemeForCategory }),
    [theme, setThemeForCategory]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext).theme;
}

export function useSetTheme() {
  return useContext(ThemeContext).setThemeForCategory;
}
