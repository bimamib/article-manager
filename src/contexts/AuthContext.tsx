
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { authService } from "@/lib/auth";
import { LoginData, RegisterData, User, AuthResponse } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking authentication:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await authService.login(data);
      authService.setUserAndToken(authData);
      setUser(authData.user);
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${authData.user.name}!`,
      });
      navigate("/articles");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Gagal",
        description: "Email atau password salah",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await authService.register(data);
      authService.setUserAndToken(authData);
      setUser(authData.user);
      toast({
        title: "Registrasi Berhasil",
        description: `Selamat datang, ${authData.user.name}!`,
      });
      navigate("/articles");
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Registrasi Gagal",
        description: "Gagal mendaftarkan akun",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logout Berhasil",
      description: "Anda telah berhasil keluar dari sistem.",
    });
    navigate("/auth/login");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
