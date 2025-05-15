
import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
  className,
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const loader = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      fullScreen ? "h-screen" : "py-12", // Increased padding for more visibility
      className
    )}>
      <Loader className={cn(sizeMap[size], "animate-spin text-primary")} />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return (
    <div className="border rounded-md p-8 w-full bg-card/50 backdrop-blur-sm">
      {loader}
    </div>
  );
};
