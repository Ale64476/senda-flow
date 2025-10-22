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
        "p-3 sm:p-4 lg:p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight",
            variant === "default" ? "text-muted-foreground" : "opacity-90"
          )}>
            {title}
          </p>
          <div className={cn(
            "p-2 sm:p-2.5 rounded-xl flex-shrink-0 shadow-sm",
            variant === "default" 
              ? "bg-primary/10 text-primary" 
              : "bg-white/25 backdrop-blur-sm text-white"
          )}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-none break-words">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-[10px] sm:text-xs font-medium leading-tight break-words",
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
