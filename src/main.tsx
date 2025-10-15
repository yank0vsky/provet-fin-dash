import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const renderApp = () =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

async function enableMocking() {
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
}

if (import.meta.env.DEV) {
  enableMocking()
    .catch((error) => {
      console.warn("Failed to start MSW, rendering app without mocks.", error);
    })
    .finally(renderApp);
} else {
  renderApp();
}
