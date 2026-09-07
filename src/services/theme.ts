export type Theme = "Dark" | "Light" | "System";

const THEME_STORAGE_KEY = "athleticore-theme";

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    stored === "Dark" ||
    stored === "Light" ||
    stored === "System"
  ) {
    return stored;
  }

  return "Dark";
}

export function getSystemTheme(): "Dark" | "Light" {
  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "Dark"
    : "Light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  const effectiveTheme =
    theme === "System"
      ? getSystemTheme()
      : theme;

  root.classList.toggle(
    "dark",
    effectiveTheme === "Dark"
  );

  localStorage.setItem(
    THEME_STORAGE_KEY,
    theme
  );
}

export function initializeTheme() {
  const theme = getStoredTheme();

  applyTheme(theme);

  if (theme !== "System") {
    return undefined;
  }

  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const handleChange = () => {
    applyTheme("System");

    window.dispatchEvent(
      new CustomEvent(
        "athleticore-system-theme-change",
        {
          detail: getSystemTheme(),
        }
      )
    );
  };

  mediaQuery.addEventListener(
    "change",
    handleChange
  );

  return () => {
    mediaQuery.removeEventListener(
      "change",
      handleChange
    );
  };
}