import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Dumbbell, Utensils, User, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Inicio" },
    { path: "/macros", icon: Utensils, label: "Macros" },
    { path: "/workouts", icon: Dumbbell, label: "Entrenamientos" },
    { path: "/calendar", icon: Calendar, label: "Calendario" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <>
      {/* Top Bar - Logo, Theme, Logout */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-card">
        <div className="w-full px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SendaFit
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-10 sm:w-10">
                {theme === "light" ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-card safe-area-bottom">
        <div className="w-full px-2 sm:px-4 py-2">
          <div className="flex justify-around items-center max-w-7xl mx-auto">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1 flex justify-center">
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col h-auto py-1.5 sm:py-2 px-2 sm:px-3 gap-0.5 sm:gap-1 w-full max-w-[80px]"
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};
