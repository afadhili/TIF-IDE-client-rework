import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./router.tsx";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import AuthProvider from "./context/auth.provider.tsx";
import { ErrorBoundary } from "./pages/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors={true} position="top-center" theme="dark" />
    </ErrorBoundary>
  </AuthProvider>,
);
