import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import SongEditPage from "./pages/SongEditPage";
import SongPage from "./pages/SongPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="status">Loading...</div>;
  }
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const location = useLocation();
  return (
    // Keyed by path so navigating away clears an error.
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/songs/new"
          element={
            <RequireAuth>
              <SongEditPage />
            </RequireAuth>
          }
        />
        <Route path="/songs/:id" element={<SongPage />} />
        <Route
          path="/songs/:id/edit"
          element={
            <RequireAuth>
              <SongEditPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
