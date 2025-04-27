
import { api, dummyData } from "@/lib/api";
import { 
  Article, 
  ArticleFormData, 
  ApiResponse, 
  PaginatedResponse
} from "@/types";

// Initialize local articles from localStorage or fallback to dummy data
const getLocalArticles = () => {
  try {
    const savedArticles = localStorage.getItem('localArticles');
    if (savedArticles) {
      console.log("Berhasil mengambil artikel dari localStorage:", JSON.parse(savedArticles));
      return JSON.parse(savedArticles);
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
    try {
      // Always refresh from localStorage first
      localArticles = getLocalArticles();
      console.log("getArticles - Artikel dari localStorage:", localArticles);
      
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (categoryId) params.append("category_id", categoryId);
      
      const response = await api.get<ApiResponse<PaginatedResponse<Article>>>(`/articles?${params.toString()}`);
      const apiArticles = response.data.data;
      
      // If API is successful, update local articles
      if (apiArticles && apiArticles.data && apiArticles.data.length > 0) {
        localArticles = apiArticles.data;
        saveLocalArticles(localArticles);
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      
      // Fallback with local data
      const filteredArticles = localArticles.filter(article => {
        const matchesCategory = categoryId ? article.category_id === categoryId : true;
        const matchesSearch = search 
          ? article.title.toLowerCase().includes(search.toLowerCase()) || 
            article.content.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchesCategory && matchesSearch;
      });
      
      console.log("Mengembalikan artikel dari localStorage:", filteredArticles);
      
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
      console.error("Error fetching article by ID:", error);
      
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
      console.error("Error fetching related articles:", error);
      
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
      localArticles = [...localArticles, newArticle];
      saveLocalArticles(localArticles);
      console.log("Artikel baru dibuat dan disimpan:", newArticle);
      
      return newArticle;
    } catch (error) {
      console.error("Error creating article:", error);
      
      // Fallback with local - simulate article creation
      const newArticle: Article = {
        id: `new-${Date.now()}`,
        title: article.title,
        content: article.content,
        image: article.image || "https://picsum.photos/seed/article/800/450",
        category_id: article.category_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: dummyData.categories.find(c => c.id === article.category_id)?.name
      };
      
      // Add new article to local array
      localArticles = getLocalArticles(); // Refresh first
      localArticles = [...localArticles, newArticle];
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
      console.error("Error updating article:", error);
      
      // Fallback with local - simulate article update
      localArticles = getLocalArticles(); // Refresh first
      const oldArticle = localArticles.find(a => a.id === id);
      const updatedArticle: Article = {
        id,
        title: article.title,
        content: article.content,
        image: article.image || oldArticle?.image || "https://picsum.photos/seed/article/800/450",
        category_id: article.category_id,
        created_at: oldArticle?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: dummyData.categories.find(c => c.id === article.category_id)?.name
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
      console.error("Error deleting article:", error);
      
      // Fallback with local - simulate article deletion
      localArticles = getLocalArticles(); // Refresh first
      localArticles = localArticles.filter(item => item.id !== id);
      saveLocalArticles(localArticles);
      console.log("Artikel berhasil dihapus secara lokal dengan ID:", id);
    }
  }
};
