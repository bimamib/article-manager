
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string; // Added avatar property as optional
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Article types
export interface Article {
  id: string;
  title: string;
  content: string;
  image: string;
  category_id: string;
  category_name?: string;
  category?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  excerpt?: string;
}

export interface ArticleFormData {
  title: string;
  content: string;
  image: string;
  category_id: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
}

// Pagination types
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// API Response types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
