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

// MSW service worker URL for production (GitHub Pages)
const getServiceWorkerURL = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  // For GitHub Pages, the service worker needs to be at the root of the domain
  // But since we're on a project page, we need it at the project path
  return `${baseUrl}mockServiceWorker.js`;
};

async function enableMocking() {
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: getServiceWorkerURL(),
    },
  });
}

// Enable MSW in all environments but handle failures gracefully
if (import.meta.env.DEV || import.meta.env.PROD) {
  enableMocking()
    .then(() => {
      console.log("MSW started successfully");
    })
    .catch((error) => {
      console.warn("Failed to start MSW, API calls may fail:", error);
    })
    .finally(() => {
      renderApp();
    });
} else {
  renderApp();
}
