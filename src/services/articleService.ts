
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
      console.log("Article data loaded from localStorage:", parsedData);
      return parsedData;
    } else {
      console.log("No articles in localStorage, using dummy data");
      return [...dummyData.articles];
    }
  } catch (error) {
    console.error("Error reading local articles:", error);
    return [...dummyData.articles];
  }
};

// Update local articles and save to localStorage
const saveLocalArticles = (articles: Article[]) => {
  try {
    localStorage.setItem('localArticles', JSON.stringify(articles));
    console.log("Articles successfully saved to localStorage:", articles);
  } catch (error) {
    console.error("Error saving local articles:", error);
  }
};

// Initial state loaded from localStorage
let localArticles = getLocalArticles();

// Process articles to ensure they have category_name
const processArticles = (articles: Article[]) => {
  return articles.map(article => {
    // If article has category object but not category_name
    if (article.category && article.category.name && !article.category_name) {
      return {
        ...article,
        category_name: article.category.name
      };
    }
    // If no category_name and no category object
    if (!article.category_name && !article.category) {
      return {
        ...article,
        category_name: `Category ${article.category_id}`
      };
    }
    return article;
  });
};

export const articleService = {
  async getArticles(page: number = 1, search: string = "", categoryId: string = "", forceRefresh: boolean = false): Promise<PaginatedResponse<Article>> {
    // Always refresh from localStorage first to get the latest data
    localArticles = getLocalArticles();
    console.log("getArticles - Articles from localStorage:", localArticles);
    console.log("getArticles - Search parameters:", { page, search, categoryId, forceRefresh });
    
    try {
      // Always try API first if forceRefresh is true
      if (forceRefresh) {
        console.log("getArticles - Force refreshing from API");
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (search) params.append("search", search);
        if (categoryId) params.append("category_id", categoryId);
        
        try {
          const response = await api.get<ApiResponse<PaginatedResponse<Article>>>(`/articles?${params.toString()}`);
          console.log("API Response:", response.data);
          const apiArticles = response.data.data;
          
          // If API is successful, update local articles
          if (apiArticles && apiArticles.data && apiArticles.data.length > 0) {
            console.log("getArticles - Updating local articles from API");
            // Process articles to ensure they have category_name
            const processedArticles = processArticles(apiArticles.data);
            localArticles = processedArticles;
            saveLocalArticles(localArticles);
            
            // Return API data directly instead of proceeding to filtering
            return apiArticles;
          }
        } catch (apiError) {
          console.error("API error, falling back to local data:", apiError);
          // Continue with local data if API fails
        }
      } else {
        console.log("getArticles - Using local data without API refresh");
      }
      
      // Fallback or continue with local storage data
      let filteredArticles = processArticles(localArticles);
      
      if (categoryId) {
        filteredArticles = filteredArticles.filter(article => article.category_id === categoryId);
      }
      
      if (search) {
        filteredArticles = filteredArticles.filter(article => {
          return article.title.toLowerCase().includes(search.toLowerCase()) || 
                (article.content && article.content.toLowerCase().includes(search.toLowerCase()));
        });
      }
      
      console.log("getArticles - Articles after filtering:", filteredArticles);
      
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
      console.error("Error fetching articles:", error);
      
      // Filter local articles as fallback
      let filteredArticles = processArticles(localArticles);
      
      if (categoryId) {
        filteredArticles = filteredArticles.filter(article => article.category_id === categoryId);
      }
      
      if (search) {
        filteredArticles = filteredArticles.filter(article => {
          return article.title.toLowerCase().includes(search.toLowerCase()) || 
                (article.content && article.content.toLowerCase().includes(search.toLowerCase()));
        });
      }
      
      console.log("getArticles - Error, using local data:", filteredArticles);
      
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
