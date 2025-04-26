
import { api, dummyData } from "@/lib/api";
import { 
  Category, 
  CategoryFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types";

export const categoryService = {
  async getCategories(page: number = 1, search: string = ""): Promise<PaginatedResponse<Category>> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>(`/categories?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Fallback with dummy data
      const filteredCategories = search 
        ? dummyData.categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : dummyData.categories;
      
      // Mock pagination
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
      
      return {
        data: paginatedCategories,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(filteredCategories.length / itemsPerPage),
          total: filteredCategories.length,
          per_page: itemsPerPage
        }
      };
    }
  },
  
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      
      // Fallback with dummy data
      const category = dummyData.categories.find(category => category.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    }
  },
  
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>("/categories/all");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      
      // Fallback with dummy data
      return dummyData.categories;
    }
  },
  
  async createCategory(category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>("/categories", category);
      return response.data.data;
    } catch (error) {
      console.error("Error creating category:", error);
      
      // Fallback with dummy data
      return {
        id: `new-${Date.now()}`,
        name: category.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },
  
  async updateCategory(id: string, category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, category);
      return response.data.data;
    } catch (error) {
      console.error("Error updating category:", error);
      
      // Fallback with dummy data
      return {
        id,
        name: category.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },
  
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      // For fallback in dummy mode, there's nothing to do
    }
  }
};
