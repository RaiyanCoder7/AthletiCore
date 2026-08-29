export type Theme = "Dark" | "Light" | "System";

const THEME_STORAGE_KEY = "athleticore-theme";

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(
    THEME_STORAGE_KEY
  );

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

  if (effectiveTheme === "Dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem(
    THEME_STORAGE_KEY,
    theme
  );
}

export function initializeTheme() {
  const theme = getStoredTheme();

  applyTheme(theme);

  if (theme === "System") {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      applyTheme("System");
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

  return undefined;
}