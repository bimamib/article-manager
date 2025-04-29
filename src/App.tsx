
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// User pages
import Index from "@/pages/Index";
import ArticlesPage from "@/pages/article/ArticlesPage";
import ArticleDetailPage from "@/pages/article/ArticleDetailPage";

// Admin pages
import CategoryListPage from "@/pages/admin/category/CategoryListPage";
import CategoryFormPage from "@/pages/admin/category/CategoryFormPage";
import ArticleListPage from "@/pages/admin/article/ArticleListPage";
import ArticleFormPage from "@/pages/admin/article/ArticleFormPage";

// Other pages
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/articles" 
                element={
                  <RequireAuth>
                    <ArticlesPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/articles/explore" 
                element={
                  <RequireAuth>
                    <ArticlesPage isExplore={true} />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/articles/:id" 
                element={
                  <RequireAuth>
                    <ArticleDetailPage />
                  </RequireAuth>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/categories" 
                element={
                  <RequireAuth requireAdmin>
                    <CategoryListPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/categories/create" 
                element={
                  <RequireAuth requireAdmin>
                    <CategoryFormPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/categories/edit/:id" 
                element={
                  <RequireAuth requireAdmin>
                    <CategoryFormPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/articles" 
                element={
                  <RequireAuth requireAdmin>
                    <ArticleListPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/articles/create" 
                element={
                  <RequireAuth requireAdmin>
                    <ArticleFormPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/articles/edit/:id" 
                element={
                  <RequireAuth requireAdmin>
                    <ArticleFormPage />
                  </RequireAuth>
                } 
              />
              
              {/* Not Found Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
