/** Purpose: Share the selected appearance theme with every frontend route. */
import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeContext from "./ThemeContext";
import { getInitialTheme, THEME_STORAGE_KEY } from "./themeStorage";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Keep the CSS root selector and persisted choice in sync with React state.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
