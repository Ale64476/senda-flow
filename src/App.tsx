import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase } from "./integrations/supabase/client";
import SplashScreen from "./components/SplashScreen";
import OnboardingForm from "./components/onboarding/OnboardingForm";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Macros from "./pages/Macros";
import Workouts from "./pages/Workouts";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileData, setProfileData] = useState<{ exists: boolean; completed: boolean }>({ 
    exists: false, 
    completed: false 
  });

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setProfileData({ 
            exists: true, 
            completed: data.onboarding_completed || false 
          });
        }
      }
      setCheckingProfile(false);
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario → redirigir a auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si no hay perfil o el perfil no está completo → redirigir a onboarding
  if (!profileData.exists || !profileData.completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // Usuario autenticado con perfil completo → permitir acceso
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const pendingReg = sessionStorage.getItem('pendingRegistration');
      
      // Permitir acceso si hay registro pendiente (usuario nuevo)
      if (pendingReg) {
        setCheckingAccess(false);
        return;
      }
      
      // Si no hay registro pendiente, verificar si es usuario autenticado sin perfil completo
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();
          
        if (profile && !profile.onboarding_completed) {
          // Usuario autenticado sin onboarding completo
          setCheckingAccess(false);
          return;
        }
      }
      
      setCheckingAccess(false);
    };

    if (!loading) {
      checkAccess();
    }
  }, [user, loading]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileData, setProfileData] = useState<{ exists: boolean; completed: boolean }>({ 
    exists: false, 
    completed: false 
  });

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setProfileData({ 
            exists: true, 
            completed: data.onboarding_completed || false 
          });
        }
      }
      setCheckingProfile(false);
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  if (loading || (user && checkingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Si hay usuario autenticado
  if (user) {
    // Si existe perfil y está completo → ir a dashboard
    if (profileData.exists && profileData.completed) {
      return <Navigate to="/dashboard" replace />;
    }
    // Si existe perfil pero no está completo, o no existe perfil → ir a onboarding
    return <Navigate to="/onboarding" replace />;
  }

  // Si no hay usuario → mostrar auth
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingForm />
          </OnboardingRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/macros"
        element={
          <ProtectedRoute>
            <Macros />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <Workouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
