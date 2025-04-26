
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema } from "@/lib/validations";
import { LogIn } from "lucide-react";
import { LoginData } from "@/types";

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loginData: LoginData = {
        email: data.email,
        password: data.password
      };
      await login(loginData);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Selamat Datang</h1>
          <p className="text-muted-foreground mt-2">
            Silahkan login untuk melanjutkan ke Articles<span className="text-primary">Hub</span>
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        type="email" 
                        autoComplete="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••" 
                        type="password" 
                        autoComplete="current-password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Memproses...</>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <p>
              Belum punya akun?{" "}
              <Link to="/auth/register" className="text-primary hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Untuk testing login sebagai admin:</p>
          <p>Email: admin@example.com | Password: password</p>
          <p>Untuk testing login sebagai user:</p>
          <p>Email: user@example.com | Password: password</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
