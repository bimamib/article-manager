
import { api, dummyData } from "@/lib/api";
import { 
  Article, 
  ArticleFormData, 
  ApiResponse, 
  PaginatedResponse
} from "@/types";

export const articleService = {
  async getArticles(page: number = 1, search: string = "", categoryId: string = ""): Promise<PaginatedResponse<Article>> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (categoryId) params.append("category_id", categoryId);
      
      const response = await api.get<ApiResponse<PaginatedResponse<Article>>>(`/articles?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      
      // Fallback with dummy data
      const filteredArticles = dummyData.articles
        .filter(article => {
          const matchesCategory = categoryId ? article.category_id === categoryId : true;
          const matchesSearch = search 
            ? article.title.toLowerCase().includes(search.toLowerCase()) || 
              article.content.toLowerCase().includes(search.toLowerCase())
            : true;
          return matchesCategory && matchesSearch;
        });
      
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
      const response = await api.get<ApiResponse<Article>>(`/articles/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      
      // Fallback with dummy data
      const article = dummyData.articles.find(article => article.id === id);
      if (!article) throw new Error("Article not found");
      return article;
    }
  },
  
  async getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
    try {
      const response = await api.get<ApiResponse<Article[]>>(`/articles/related/${categoryId}?exclude=${currentArticleId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching related articles:", error);
      
      // Fallback with dummy data
      return dummyData.articles
        .filter(article => article.category_id === categoryId && article.id !== currentArticleId)
        .slice(0, 3);
    }
  },
  
  async createArticle(article: ArticleFormData): Promise<Article> {
    try {
      const response = await api.post<ApiResponse<Article>>("/articles", article);
      return response.data.data;
    } catch (error) {
      console.error("Error creating article:", error);
      
      // Fallback with dummy data
      const newArticle: Article = {
        id: `new-${Date.now()}`,
        title: article.title,
        content: article.content,
        image: article.image,
        category_id: article.category_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: dummyData.categories.find(c => c.id === article.category_id)?.name
      };
      
      return newArticle;
    }
  },
  
  async updateArticle(id: string, article: ArticleFormData): Promise<Article> {
    try {
      const response = await api.put<ApiResponse<Article>>(`/articles/${id}`, article);
      return response.data.data;
    } catch (error) {
      console.error("Error updating article:", error);
      
      // Fallback with dummy data
      return {
        id,
        title: article.title,
        content: article.content,
        image: article.image,
        category_id: article.category_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: dummyData.categories.find(c => c.id === article.category_id)?.name
      };
    }
  },
  
  async deleteArticle(id: string): Promise<void> {
    try {
      await api.delete(`/articles/${id}`);
    } catch (error) {
      console.error("Error deleting article:", error);
      // For fallback in dummy mode, there's nothing to do
    }
  }
};
