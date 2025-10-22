import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Dumbbell, Utensils, User, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-card">
        <div className="flex items-center justify-between px-4 h-16 sm:h-18">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SendaFit
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10 h-10 w-10"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive h-10 w-10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom shadow-elevated">
        <div className="flex items-center justify-around h-20 px-2 sm:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 h-16 flex-1 rounded-2xl transition-all duration-300",
                  active
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className={cn("h-6 w-6 transition-transform duration-300", active && "scale-110")} />
                <span className={cn("text-xs font-medium transition-all", active && "font-bold")}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
