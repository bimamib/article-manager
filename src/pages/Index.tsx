
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  } else {
    return <Navigate to="/auth/login" replace />;
  }
};

export default Index;
