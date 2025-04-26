
import { api, dummyData } from "@/lib/api";
import { 
  Category, 
  CategoryFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types";

// Menyimpan data lokal sementara untuk simulasi server
let localCategories = [...dummyData.categories];

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
      
      // Fallback dengan data lokal
      const filteredCategories = search 
        ? localCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : localCategories;
      
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
      
      // Fallback dengan data lokal
      const category = localCategories.find(category => category.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    }
  },
  
  async getAllCategories(): Promise<Category[]> {
    try {
      // Changed from '/categories/all' to '/categories' with a parameter to match API endpoint
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>("/categories?per_page=100");
      return response.data.data.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      
      // Fallback dengan data lokal
      return localCategories;
    }
  },
  
  async createCategory(category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>("/categories", category);
      return response.data.data;
    } catch (error) {
      console.error("Error creating category:", error);
      
      // Fallback dengan data lokal - simulasikan pembuatan kategori
      const newCategory = {
        id: `new-${Date.now()}`,
        name: category.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Tambahkan kategori baru ke array lokal
      localCategories = [...localCategories, newCategory];
      
      return newCategory;
    }
  },
  
  async updateCategory(id: string, category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, category);
      return response.data.data;
    } catch (error) {
      console.error("Error updating category:", error);
      
      // Fallback dengan data lokal - simulasikan pembaruan kategori
      localCategories = localCategories.map(item => 
        item.id === id ? { ...item, name: category.name, updated_at: new Date().toISOString() } : item
      );
      
      const updatedCategory = localCategories.find(item => item.id === id);
      if (!updatedCategory) throw new Error("Category not found");
      
      return updatedCategory;
    }
  },
  
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      
      // Fallback dengan data lokal - simulasikan penghapusan kategori
      localCategories = localCategories.filter(item => item.id !== id);
    }
  }
};
