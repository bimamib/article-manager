
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { CategoryFilter } from "@/components/article/CategoryFilter";
import { SearchBar } from "@/components/article/SearchBar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { articleService } from "@/services/articleService";
import { Article, PaginatedResponse } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 9,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response: PaginatedResponse<Article> = await articleService.getArticles(
          currentPage,
          searchQuery,
          selectedCategory
        );
        setArticles(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Explore Articles</h1>
        <p className="text-muted-foreground">
          Discover the latest articles and insights
        </p>
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
