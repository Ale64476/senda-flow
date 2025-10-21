import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerServiceWorker";

// Registrar Service Worker para PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
