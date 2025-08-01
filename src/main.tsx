import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { UsersProvider } from "./context/UsersContext.tsx";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <AuthProvider>
          <UsersProvider>
            <App />
          </UsersProvider>
        </AuthProvider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>
);
