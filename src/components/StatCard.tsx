import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "accent";
  className?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) => {
  const variants = {
    default: "bg-gradient-card",
    primary: "bg-gradient-primary text-primary-foreground",
    secondary: "bg-gradient-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 lg:p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
          <p className={cn(
            "text-xs sm:text-sm font-semibold truncate uppercase tracking-wide",
            variant === "default" ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-xs sm:text-sm truncate font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 sm:p-3.5 lg:p-4 rounded-2xl flex-shrink-0 shadow-sm",
          variant === "default" 
            ? "bg-primary/10 text-primary" 
            : "bg-white/25 backdrop-blur-sm text-white"
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
        </div>
      </div>
    </Card>
  );
};
