import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Detectar token de recovery ANTES de renderizar a aplicação
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const type = hashParams.get('type');
const accessToken = hashParams.get('access_token');

if (type === 'recovery' && accessToken && !window.location.pathname.includes('/reset-password')) {
  console.log('[MAIN] Recovery token detected, redirecting to /reset-password');
  // Redirecionar para reset-password mantendo o hash
  window.location.href = `/reset-password${window.location.hash}`;
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
