import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";
import "./hero.css";
import "./cards.css";
import Hero from "./pages/Hero.jsx";
import MyCards from "./pages/MyCards.jsx";
import NewCard from "./pages/NewCard.jsx";
import CardView from "./pages/CardView.jsx";
import SharedView from "./pages/SharedView.jsx";
import PrintCard from "./pages/PrintCard.jsx";
import OwnerArea from "./components/OwnerArea.jsx";

const THEME_KEY = "digilease-theme";
let initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
try {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") initialTheme = savedTheme;
} catch { /* The system preference still gives us a safe default. */ }
document.documentElement.dataset.theme = initialTheme;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/s/:token" element={<SharedView />} />
        <Route element={<OwnerArea />}>
          <Route path="/cards" element={<MyCards />} />
          <Route path="/new" element={<NewCard />} />
          <Route path="/card/:id" element={<CardView />} />
          <Route path="/card/:id/print/:token" element={<PrintCard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
