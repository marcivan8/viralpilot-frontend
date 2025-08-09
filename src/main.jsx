import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-[length:200%_200%] bg-gradient-to-br from-sky-200 via-blue-300 to-sky-500 z-0" />

      {/* Cloud layers (must have CSS classes defined for cloud animations) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* App content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <App />
      </div>
    </div>
  </React.StrictMode>
);
