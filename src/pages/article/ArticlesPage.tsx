
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { CategoryFilter } from "@/components/article/CategoryFilter";
import { SearchBar } from "@/components/article/SearchBar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { articleService } from "@/services/articleService";
import { Article, PaginatedResponse } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ArticlesPage: React.FC = () => {
  // Initialize articles as an empty array
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 9,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchArticles = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<Article> = await articleService.getArticles(
        currentPage,
        searchQuery,
        selectedCategory,
        forceRefresh
      );
      console.log("Artikel yang diambil:", response.data);
      
      // Ensure we have a valid array of articles and pagination data
      setArticles(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination || {
        current_page: 1,
        total_pages: 1,
        total: 0,
        per_page: 9,
      });
    } catch (error) {
      console.error("Error mengambil artikel:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil artikel",
        variant: "destructive",
      });
      // Set empty state on error
      setArticles([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total: 0,
        per_page: 9,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch articles when component mounts with force refresh
  useEffect(() => {
    console.log("ArticlePage - Komponen dimuat, memaksa refresh");
    fetchArticles(true);
  }, []);
  
  // Re-fetch when page, search or category changes
  useEffect(() => {
    console.log("ArticlePage - Halaman, pencarian, atau kategori berubah");
    fetchArticles(false);
  }, [currentPage, searchQuery, selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleRefresh = async () => {
    console.log("Tombol refresh ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchArticles(true);
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Jelajahi Artikel</h1>
            <p className="text-muted-foreground">
              Temukan artikel dan wawasan terbaru
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <SearchBar
              onSearch={handleSearch}
              className={isMobile ? "w-full" : "w-[300px]"}
            />
            {isMobile && (
              <div className="flex justify-center">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                />
              </div>
            )}
          </div>

          <ArticleGrid articles={articles} isLoading={isLoading} />
          
          <PaginationControls
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
