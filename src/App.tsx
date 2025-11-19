import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventsPage from "./pages/EventsPage";
import AnggotaPage from "./pages/AnggotaPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import AttendanceSeniorPage from "./pages/AttendanceSeniorPage";
import AttendanceUmumPage from "./pages/AttendanceUmumPage";
import AttendancePanitiaPage from "./pages/AttendancePanitiaPage";
import AnimatedBackground from "./components/AnimatedBackground";
import PageTransition from "./components/PageTransition";
import { AnimationProvider } from "./contexts/AnimationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-space-blue flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-electric-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-blue flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-electric-cyan border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AnimationProvider>
        <Router>
          <div className="min-h-screen bg-space-blue text-white overflow-x-hidden">
            <Routes>
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/attendance/senior/:eventId" element={<AttendanceSeniorPage />} />
              <Route path="/attendance/umum/:eventId" element={<AttendanceUmumPage />} />
              <Route path="/attendance/panitia/:eventId" element={<AttendancePanitiaPage />} />
              <Route
                path="/*"
                element={
                  <>
                    <AnimatedBackground />
                    <Navigation />
                    <PageTransition>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/anggota" element={<AnggotaPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </PageTransition>
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </AnimationProvider>
    </AuthProvider>
  );
}

export default App;
