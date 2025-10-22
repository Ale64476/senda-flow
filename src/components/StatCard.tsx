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
        "p-3 sm:p-4 shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide leading-tight mb-1.5",
              variant === "default" ? "text-muted-foreground" : "opacity-90"
            )}>
              {title}
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold leading-none break-words">{value}</p>
          </div>
          <div className={cn(
            "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
            variant === "default" 
              ? "bg-primary/10 text-primary" 
              : "bg-white/25 backdrop-blur-sm text-white"
          )}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        {subtitle && (
          <p className={cn(
            "text-[9px] sm:text-[10px] font-medium leading-tight break-words",
            variant === "default" ? "text-muted-foreground" : "opacity-80"
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
};
