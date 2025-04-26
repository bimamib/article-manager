
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen text="Memeriksa autentikasi..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/articles" replace />;
  }

  return <>{children}</>;
};
