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
        "p-3 sm:p-4 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-full",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col h-full justify-between gap-2.5 sm:gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-xs sm:text-sm font-semibold uppercase tracking-wide leading-tight flex-1",
            variant === "default" ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <div className={cn(
            "p-2 sm:p-2.5 rounded-lg flex-shrink-0",
            variant === "default" 
              ? "bg-primary/10 text-primary" 
              : "bg-white/25 backdrop-blur-sm text-white"
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-none break-words">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-[10px] sm:text-xs font-medium leading-snug break-words",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
