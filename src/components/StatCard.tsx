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
        "p-3 sm:p-4 lg:p-6 shadow-card hover:shadow-elevated transition-all duration-300",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className={cn(
            "text-xs sm:text-sm font-medium truncate",
            variant === "default" ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-xs sm:text-sm truncate",
              variant === "default" ? "text-muted-foreground" : "opacity-75"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0",
          variant === "default" 
            ? "bg-primary/10 text-primary" 
            : "bg-white/20"
        )}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
      </div>
    </Card>
  );
};
