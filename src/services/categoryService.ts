
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
    if (savedCategories) {
      console.log("Berhasil mengambil kategori dari localStorage:", JSON.parse(savedCategories));
      return JSON.parse(savedCategories);
    } else {
      console.log("Tidak ada kategori di localStorage, menggunakan data dummy");
      return [...dummyData.categories];
    }
  } catch (error) {
    console.error("Error saat membaca kategori lokal:", error);
    return [...dummyData.categories];
  }
};

// Update local categories and save to localStorage
const saveLocalCategories = (categories: Category[]) => {
  try {
    localStorage.setItem('localCategories', JSON.stringify(categories));
    console.log("Kategori berhasil disimpan ke localStorage:", categories);
  } catch (error) {
    console.error("Error saat menyimpan kategori lokal:", error);
  }
};

// Initial state loaded from localStorage
let localCategories = getLocalCategories();

export const categoryService = {
  async getCategories(page: number = 1, search: string = ""): Promise<PaginatedResponse<Category>> {
    try {
      // Selalu refresh dari localStorage terlebih dahulu
      localCategories = getLocalCategories();
      console.log("getCategories - Kategori dari localStorage:", localCategories);
      
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>(`/categories?${params.toString()}`);
      const apiCategories = response.data.data;
      
      // Jika API berhasil, update kategori lokal
      if (apiCategories && apiCategories.data && apiCategories.data.length > 0) {
        localCategories = apiCategories.data;
        saveLocalCategories(localCategories);
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Error saat mengambil kategori:", error);
      
      // Fallback with local storage data
      const filteredCategories = search 
        ? localCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : localCategories;
      
      console.log("Mengembalikan kategori dari localStorage:", filteredCategories);
      
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
      // Selalu refresh dari localStorage terlebih dahulu
      localCategories = getLocalCategories();
      
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error saat mengambil kategori berdasarkan ID:", error);
      
      // Fallback with local storage data
      const category = localCategories.find(category => category.id === id);
      if (!category) throw new Error("Kategori tidak ditemukan");
      return category;
    }
  },
  
  async getAllCategories(forceRefresh: boolean = false): Promise<Category[]> {
    try {
      // Selalu refresh dari localStorage terlebih dahulu
      localCategories = getLocalCategories();
      console.log("getAllCategories - Kategori dari localStorage:", localCategories);
      
      // Try API call
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>("/categories?per_page=100");
      const apiCategories = response.data.data.data;
      
      // If successful API call, update local categories
      if (Array.isArray(apiCategories) && apiCategories.length > 0) {
        localCategories = apiCategories;
        saveLocalCategories(localCategories);
        console.log("getAllCategories - Kategori dari API disimpan:", apiCategories);
        return apiCategories;
      }
      
      console.log("getAllCategories - Mengembalikan kategori dari localStorage:", localCategories);
      return localCategories;
    } catch (error) {
      console.error("Error saat mengambil semua kategori:", error);
      console.log("getAllCategories - Error, mengembalikan kategori dari localStorage:", localCategories);
      return localCategories;
    }
  },
  
  async createCategory(category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>("/categories", category);
      const newCategory = response.data.data;
      
      // Update local categories storage
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = [...localCategories, newCategory];
      saveLocalCategories(localCategories);
      console.log("Kategori baru dibuat dan disimpan:", newCategory);
      
      return newCategory;
    } catch (error) {
      console.error("Error saat membuat kategori:", error);
      
      // Fallback with local storage - simulate category creation
      const newCategory = {
        id: `new-${Date.now()}`,
        name: category.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add new category to local array
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = [...localCategories, newCategory];
      saveLocalCategories(localCategories);
      console.log("Kategori baru dibuat secara lokal:", newCategory);
      
      return newCategory;
    }
  },
  
  async updateCategory(id: string, category: CategoryFormData): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, category);
      const updatedCategory = response.data.data;
      
      // Update local categories storage
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = localCategories.map(item => 
        item.id === id ? updatedCategory : item
      );
      saveLocalCategories(localCategories);
      console.log("Kategori berhasil diperbarui:", updatedCategory);
      
      return updatedCategory;
    } catch (error) {
      console.error("Error saat memperbarui kategori:", error);
      
      // Fallback with local storage - simulate category update
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = localCategories.map(item => 
        item.id === id ? { ...item, name: category.name, updated_at: new Date().toISOString() } : item
      );
      saveLocalCategories(localCategories);
      
      const updatedCategory = localCategories.find(item => item.id === id);
      if (!updatedCategory) throw new Error("Kategori tidak ditemukan");
      console.log("Kategori berhasil diperbarui secara lokal:", updatedCategory);
      
      return updatedCategory;
    }
  },
  
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
      
      // Update local categories storage
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = localCategories.filter(item => item.id !== id);
      saveLocalCategories(localCategories);
      console.log("Kategori berhasil dihapus dengan ID:", id);
    } catch (error) {
      console.error("Error saat menghapus kategori:", error);
      
      // Fallback with local storage - simulate category deletion
      localCategories = getLocalCategories(); // Refresh terlebih dahulu
      localCategories = localCategories.filter(item => item.id !== id);
      saveLocalCategories(localCategories);
      console.log("Kategori berhasil dihapus secara lokal dengan ID:", id);
    }
  }
};
