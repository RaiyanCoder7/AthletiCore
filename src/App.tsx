import { useEffect } from "react";

import AppRouter from "@/app/router/AppRouter";

import { initializeTheme } from "@/services/theme";

function App() {
  useEffect(() => {
    const cleanup = initializeTheme();

    return cleanup;
  }, []);

  return <AppRouter />;
}

export default App;