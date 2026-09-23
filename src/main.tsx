import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { useArchiveStore } from "./store/useArchiveStore";
import "./styles/index.css";

(window as Window & { __echoStore?: typeof useArchiveStore }).__echoStore = useArchiveStore;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
