
import React from "react";
import { MachineStatus, StatusColorMap, StatusNameMap } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: MachineStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusBadge = ({ 
  status, 
  showLabel = true, 
  size = "md",
  className 
}: StatusBadgeProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <span className={cn(
        "rounded-full mr-2",
        StatusColorMap[status],
        sizeClasses[size]
      )} />
      {showLabel && (
        <span className="text-sm font-medium">{StatusNameMap[status]}</span>
      )}
    </div>
  );
};

export default StatusBadge;
