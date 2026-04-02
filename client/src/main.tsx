import { createRoot } from "react-dom/client";
import App from "./App";
import { installSweetAlertBridge } from "./lib/alerts";
import { initializeAnalytics } from "./lib/analytics";
import "./index.css";

installSweetAlertBridge();
initializeAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
