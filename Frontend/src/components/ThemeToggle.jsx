/** Purpose: Let users switch the site-wide light/dark appearance. */
import { FaMoon, FaSun } from "react-icons/fa";
import useTheme from "../theme/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      className="fixed bottom-4 right-4 z-[60] grid h-12 w-12 place-items-center rounded-full border border-ln bg-sf text-ink shadow-lg transition hover:bg-soft max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom,0px))]"
      onClick={toggleTheme}
      title={label}
    >
      {isDark ? (
        <FaSun aria-hidden="true" className="h-5 w-5" />
      ) : (
        <FaMoon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
