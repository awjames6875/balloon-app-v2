import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/context/auth-context";
import { DesignProvider } from "@/context/design-context";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <DesignProvider>
      <App />
    </DesignProvider>
  </AuthProvider>
);
