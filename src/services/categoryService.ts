
import { api, dummyData } from "@/lib/api";
import { 
  Category, 
  CategoryFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types";

// Initialize local categories from localStorage or fallback to dummy data
const getLocalCategories = () => {
  try {
    const savedCategories = localStorage.getItem('localCategories');
    return savedCategories ? JSON.parse(savedCategories) : [...dummyData.categories];
  } catch (error) {
    console.error("Error reading local categories:", error);
    return [...dummyData.categories];
  }
};

// Update local categories and save to localStorage
const saveLocalCategories = (categories: Category[]) => {
  try {
    localStorage.setItem('localCategories', JSON.stringify(categories));
  } catch (error) {
    console.error("Error saving local categories:", error);
  }
};

// Initial state loaded from localStorage
let localCategories = getLocalCategories();

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
      
      // Fallback with local storage data
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
      
      // Fallback with local storage data
      const category = localCategories.find(category => category.id === id);
      if (!category) throw new Error("Category not found");
      return category;
    }
  },
  
  async getAllCategories(forceRefresh: boolean = false): Promise<Category[]> {
    try {
      // Changed from '/categories/all' to '/categories' with a parameter to match API endpoint
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>("/categories?per_page=100");
      const apiCategories = response.data.data.data;
      
      // If successful API call, update local categories
      if (apiCategories && apiCategories.length > 0) {
        localCategories = apiCategories;
        saveLocalCategories(localCategories);
      }
      
      return apiCategories;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      
      // Fallback with local storage data
      return localCategories;
    }
  },
  
  async createCategory(category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>("/categories", category);
      const newCategory = response.data.data;
      
      // Update local categories storage
      localCategories = [...localCategories, newCategory];
      saveLocalCategories(localCategories);
      
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      
      // Fallback with local storage - simulate category creation
      const newCategory = {
        id: `new-${Date.now()}`,
        name: category.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add new category to local array
      localCategories = [...localCategories, newCategory];
      saveLocalCategories(localCategories);
      
      return newCategory;
    }
  },
  
  async updateCategory(id: string, category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, category);
      const updatedCategory = response.data.data;
      
      // Update local categories storage
      localCategories = localCategories.map(item => 
        item.id === id ? updatedCategory : item
      );
      saveLocalCategories(localCategories);
      
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      
      // Fallback with local storage - simulate category update
      localCategories = localCategories.map(item => 
        item.id === id ? { ...item, name: category.name, updated_at: new Date().toISOString() } : item
      );
      saveLocalCategories(localCategories);
      
      const updatedCategory = localCategories.find(item => item.id === id);
      if (!updatedCategory) throw new Error("Category not found");
      
      return updatedCategory;
    }
  },
  
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
      
      // Update local categories storage
      localCategories = localCategories.filter(item => item.id !== id);
      saveLocalCategories(localCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
      
      // Fallback with local storage - simulate category deletion
      localCategories = localCategories.filter(item => item.id !== id);
      saveLocalCategories(localCategories);
    }
  }
};
