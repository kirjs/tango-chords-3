import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SongsProvider } from "./context/SongsContext";
import "@fontsource/old-standard-tt/400.css";
import "@fontsource/old-standard-tt/400-italic.css";
import "@fontsource/old-standard-tt/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
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
