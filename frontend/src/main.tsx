import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initAutoSync } from "./offline";
import { reprannSosSiAktif } from "./sos";
import "./styles.css";

initAutoSync();
reprannSosSiAktif();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
