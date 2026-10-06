import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SongsProvider } from "./context/SongsContext";
import "./global.scss";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SongsProvider>
          <App />
        </SongsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
