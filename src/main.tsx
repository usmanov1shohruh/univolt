import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initTelegramWebApp } from "@/telegram/webApp";

initTelegramWebApp();

createRoot(document.getElementById("root")!).render(<App />);
