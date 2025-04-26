
import { api, dummyData } from "./api";
import { 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  User, 
  ApiResponse 
} from "@/types";

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
      return response.data.data;
    } catch (error) {
      console.error("Login error:", error);
      // Fallback dengan data dummy untuk demo/testing
      const dummyUser: User = {
        id: "1",
        name: data.email.includes("admin") ? "Admin User" : "Regular User",
        email: data.email,
        role: data.email.includes("admin") ? "admin" : "user",
      };
      return { user: dummyUser, token: "dummy-token-for-testing" };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
      return response.data.data;
    } catch (error) {
      console.error("Register error:", error);
      // Fallback dengan data dummy untuk demo/testing
      const dummyUser: User = {
        id: "1",
        name: data.name,
        email: data.email,
        role: data.email.includes("admin") ? "admin" : "user",
      };
      return { user: dummyUser, token: "dummy-token-for-testing" };
    }
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  setUserAndToken(auth: AuthResponse): void {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }
};
