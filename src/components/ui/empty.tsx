
import React from "react";
import { cn } from "@/lib/utils";
import { FileX } from "lucide-react";

interface EmptyProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  message = "Tidak ada data",
  icon,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      {icon || <FileX className="h-12 w-12 text-muted-foreground mb-4" />}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
