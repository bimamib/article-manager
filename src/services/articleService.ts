
import { api, dummyData } from "@/lib/api";
import { 
  Article, 
  ArticleFormData, 
  ApiResponse, 
  PaginatedResponse
} from "@/types";
import { categoryService } from "@/services/categoryService";

// Initialize local articles from localStorage or fallback to dummy data
const getLocalArticles = () => {
  try {
    const savedArticles = localStorage.getItem('localArticles');
    if (savedArticles) {
      const parsedData = JSON.parse(savedArticles);
      console.log("Berhasil mengambil artikel dari localStorage:", parsedData);
      return parsedData;
    } else {
      console.log("Tidak ada artikel di localStorage, menggunakan data dummy");
      return [...dummyData.articles];
    }
  } catch (error) {
    console.error("Error saat membaca artikel lokal:", error);
    return [...dummyData.articles];
  }
};

// Update local articles and save to localStorage
const saveLocalArticles = (articles: Article[]) => {
  try {
    localStorage.setItem('localArticles', JSON.stringify(articles));
    console.log("Artikel berhasil disimpan ke localStorage:", articles);
  } catch (error) {
    console.error("Error saat menyimpan artikel lokal:", error);
  }
};

// Initial state loaded from localStorage
let localArticles = getLocalArticles();

export const articleService = {
  async getArticles(page: number = 1, search: string = "", categoryId: string = "", forceRefresh: boolean = false): Promise<PaginatedResponse<Article>> {
    // Always refresh from localStorage first to get the latest data
    localArticles = getLocalArticles();
    console.log("getArticles - Artikel dari localStorage:", localArticles);
    console.log("getArticles - Parameter pencarian:", { page, search, categoryId, forceRefresh });
    
    try {
      if (!forceRefresh && localArticles && localArticles.length > 0) {
        // Use local storage data directly if not forcing refresh
        console.log("getArticles - Menggunakan data lokal tanpa refresh API");
      } else {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (categoryId) params.append("category_id", categoryId);
        
        const response = await api.get<ApiResponse<PaginatedResponse<Article>>>(`/articles?${params.toString()}`);
        const apiArticles = response.data.data;
        
        // If API is successful, update local articles
        if (apiArticles && apiArticles.data && apiArticles.data.length > 0) {
          console.log("getArticles - Mengupdate artikel lokal dari API");
          localArticles = apiArticles.data;
          saveLocalArticles(localArticles);
        }
      }
      
      // Fallback with local storage data
      let filteredArticles = [...localArticles]; // Create a copy to avoid reference issues
      
      // Apply category filter if categoryId is provided (not empty string)
      if (categoryId && categoryId !== "") {
        console.log(`getArticles - Filtering by category ID: ${categoryId}`);
        filteredArticles = filteredArticles.filter(article => article.category_id === categoryId);
      } else {
        console.log("getArticles - No category filter applied, showing all articles");
      }
      
      // Apply search filter if search is provided
      if (search && search !== "") {
        console.log(`getArticles - Filtering by search term: ${search}`);
        filteredArticles = filteredArticles.filter(article => {
          return article.title.toLowerCase().includes(search.toLowerCase()) || 
                (article.content && article.content.toLowerCase().includes(search.toLowerCase()));
        });
      }
      
      console.log("getArticles - Artikel setelah filter:", filteredArticles);
      
      // Mock pagination
      const itemsPerPage = 9;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
      
      return {
        data: paginatedArticles,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(filteredArticles.length / itemsPerPage),
          total: filteredArticles.length,
          per_page: itemsPerPage
        }
      };
    } catch (error) {
      console.error("Error mengambil artikel:", error);
      
      // Filter local articles as fallback
      let filteredArticles = [...localArticles]; // Create a copy to avoid reference issues
      
      // Apply category filter if categoryId is provided (not empty string)
      if (categoryId && categoryId !== "") {
        filteredArticles = filteredArticles.filter(article => article.category_id === categoryId);
      }
      
      // Apply search filter if search is provided
      if (search && search !== "") {
        filteredArticles = filteredArticles.filter(article => {
          return article.title.toLowerCase().includes(search.toLowerCase()) || 
                (article.content && article.content.toLowerCase().includes(search.toLowerCase()));
        });
      }
      
      console.log("getArticles - Error, menggunakan data lokal:", filteredArticles);
      
      // Mock pagination
      const itemsPerPage = 9;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
      
      return {
        data: paginatedArticles,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(filteredArticles.length / itemsPerPage),
          total: filteredArticles.length,
          per_page: itemsPerPage
        }
      };
    }
  },
  
  async getArticleById(id: string): Promise<Article> {
    try {
      // Always refresh from localStorage first
      localArticles = getLocalArticles();
      
      const response = await api.get<ApiResponse<Article>>(`/articles/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error mengambil artikel berdasarkan ID:", error);
      
      // Fallback with local data
      const article = localArticles.find(article => article.id === id);
      if (!article) throw new Error("Artikel tidak ditemukan");
      return article;
    }
  },
  
  async getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    try {
      // Always refresh from localStorage first
      localArticles = getLocalArticles();
      
      const response = await api.get<ApiResponse<Article[]>>(`/articles/related/${categoryId}?exclude=${currentArticleId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error mengambil artikel terkait:", error);
      
      // Fallback with local data
      return localArticles
        .filter(article => article.category_id === categoryId && article.id !== currentArticleId)
        .slice(0, 3);
    }
  },
  
  async createArticle(article: ArticleFormData): Promise<Article> {
    try {
      const response = await api.post<ApiResponse<Article>>("/articles", article);
      const newArticle = response.data.data;
      
      // Update local articles storage
      localArticles = getLocalArticles(); // Refresh first
      localArticles = [newArticle, ...localArticles]; // Add to beginning of array
      saveLocalArticles(localArticles);
      console.log("Artikel baru dibuat dan disimpan:", newArticle);
      
      return newArticle;
    } catch (error) {
      console.error("Error saat membuat artikel:", error);
      
      // Get the category name
      const categories = await categoryService.getAllCategories();
      const categoryName = categories.find(c => c.id === article.category_id)?.name || "Tanpa Kategori";
      
      // Fallback with local storage - simulate article creation
      const newArticle: Article = {
        id: `new-${Date.now()}`,
        title: article.title,
        content: article.content,
        image: article.image || "https://picsum.photos/seed/article/800/450",
        category_id: article.category_id,
        category_name: categoryName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add new article to beginning of local array
      localArticles = getLocalArticles(); // Refresh first
      localArticles = [newArticle, ...localArticles]; // Add to beginning of array
      saveLocalArticles(localArticles);
      console.log("Artikel baru dibuat secara lokal:", newArticle);
      
      return newArticle;
    }
  },
  
  async updateArticle(id: string, article: ArticleFormData): Promise<Article> {
    try {
      const response = await api.put<ApiResponse<Article>>(`/articles/${id}`, article);
      const updatedArticle = response.data.data;
      
      // Update local articles storage
      localArticles = getLocalArticles(); // Refresh first
      localArticles = localArticles.map(item => 
        item.id === id ? updatedArticle : item
      );
      saveLocalArticles(localArticles);
      console.log("Artikel berhasil diperbarui:", updatedArticle);
      
      return updatedArticle;
    } catch (error) {
      console.error("Error saat memperbarui artikel:", error);
      
      // Dapatkan kategori untuk nama kategori
      const categories = await categoryService.getAllCategories();
      const categoryName = categories.find(c => c.id === article.category_id)?.name || "Tanpa Kategori";
      
      // Fallback with local - simulate article update
      localArticles = getLocalArticles(); // Refresh first
      const oldArticle = localArticles.find(a => a.id === id);
      if (!oldArticle) throw new Error("Artikel tidak ditemukan");
      
      const updatedArticle: Article = {
        id,
        title: article.title,
        content: article.content,
        image: article.image || oldArticle?.image || "https://picsum.photos/seed/article/800/450",
        category_id: article.category_id,
        category_name: categoryName,
        created_at: oldArticle?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localArticles = localArticles.map(item => 
        item.id === id ? updatedArticle : item
      );
      saveLocalArticles(localArticles);
      console.log("Artikel berhasil diperbarui secara lokal:", updatedArticle);
      
      return updatedArticle;
    }
  },
  
  async deleteArticle(id: string): Promise<void> {
    try {
      await api.delete(`/articles/${id}`);
      
      // Update local articles storage
      localArticles = getLocalArticles(); // Refresh first
      localArticles = localArticles.filter(item => item.id !== id);
      saveLocalArticles(localArticles);
      console.log("Artikel berhasil dihapus dengan ID:", id);
    } catch (error) {
      console.error("Error saat menghapus artikel:", error);
      
      // Fallback with local - simulate article deletion
      localArticles = getLocalArticles(); // Refresh first
      localArticles = localArticles.filter(item => item.id !== id);
      saveLocalArticles(localArticles);
      console.log("Artikel berhasil dihapus secara lokal dengan ID:", id);
    }
  }
};
