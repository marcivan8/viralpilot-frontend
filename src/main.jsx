import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-[length:200%_200%] bg-gradient-to-br from-sky-200 via-blue-300 to-sky-500 z-0"></div>

      {/* Cloud layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* App content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <App />
      </div>
    </div>
  </React.StrictMode>
);
