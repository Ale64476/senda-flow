import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LucideIcon, Lock } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

interface ProButtonProps {
  icon: LucideIcon;
  label: string;
  featureTitle: string;
  featureDescription: string;
  features: string[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  disabled?: boolean;
}

export const ProButton = ({
  icon: Icon,
  label,
  featureTitle,
  featureDescription,
  features,
  variant = "outline",
  size = "default",
  className = "",
  disabled = false,
}: ProButtonProps) => {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`relative gap-2 ${className}`}
        onClick={() => !disabled && setUpgradeModalOpen(true)}
        disabled={disabled}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">{label}</span>
        <Badge variant="default" className="ml-auto gap-1 text-xs">
          <Lock className="w-3 h-3" />
          PRO
        </Badge>
      </Button>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        featureTitle={featureTitle}
        featureDescription={featureDescription}
        features={features}
      />
    </>
  );
};
