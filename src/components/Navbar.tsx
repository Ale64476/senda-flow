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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SendaFit
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col h-auto py-2 px-3 gap-1"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};
