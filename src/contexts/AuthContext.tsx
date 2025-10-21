import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar y limpiar sesión inicial
    const checkAndCleanSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session) {
          // Verificar que el usuario existe en la base de datos
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            // Usuario no existe o token inválido - limpiar sesión
            console.warn("Invalid session detected, cleaning up...");
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.");
          } else {
            setSession(session);
            setUser(userData.user);
          }
        }
      } catch (error) {
        console.error("Error in session check:", error);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAndCleanSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            // Verificar que el usuario existe
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError || !userData.user) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.");
            } else {
              setSession(session);
              setUser(userData.user);
            }
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
