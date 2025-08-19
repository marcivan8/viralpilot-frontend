// ===== src/main.jsx =====
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* Background animé en arrière-plan */}
    <div className="animated-bg" />
    
    {/* App content avec bon z-index */}
    <div className="app-container">
      <App />
    </div>
  </React.StrictMode>
);