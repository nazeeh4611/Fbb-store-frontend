import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { warmUpBackend } from "./lib/api";
import "./index.css";

// Start waking the API (free-tier hosts sleep) while the UI is still loading.
warmUpBackend();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
