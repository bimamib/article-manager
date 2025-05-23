
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
import { motion } from "framer-motion";

// Custom hook for detecting desktop view (above 1024px)
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  return isDesktop;
};

interface ArticlesPageProps {
  isExplore?: boolean;
}

const ArticlesPage: React.FC<ArticlesPageProps> = ({ isExplore = false }) => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const { toast } = useToast();

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const fetchArticles = async (forceRefresh: boolean = true) => {
    console.log("ArticlesPage - Setting isLoading to true");
    setIsLoading(true); // Ensure loading state is set to true
    setError(null); // Clear any previous errors
    
    try {
      console.log("ArticlesPage - Fetching articles with forceRefresh:", forceRefresh);
      
      // Convert "all" to empty string for API
      const categoryParam = selectedCategory === "all" ? "" : selectedCategory;

      // Always get from API through the service when filters change
      const response: PaginatedResponse<Article> =
        await articleService.getArticles(
          currentPage,
          searchQuery,
          categoryParam,
          forceRefresh
        );

      console.log("ArticlesPage - Articles fetched:", response);
      
      // Ensure articles data is an array
      if (Array.isArray(response.data)) {
        console.log("ArticlesPage - Setting articles:", response.data);
        setArticles(response.data);
      } else {
        console.error("Invalid article data format:", response.data);
        setArticles([]);
        setError("Invalid article data format");
        toast({
          title: "Warning",
          description: "Invalid article data format",
          variant: "destructive",
        });
      }

      setPagination(
        response.pagination || {
          current_page: currentPage,
          total_pages: 1,
          total: 0,
          per_page: 9,
        }
      );
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to fetch articles");
      toast({
        title: "Error",
        description: "Failed to fetch articles. Please try refreshing.",
        variant: "destructive",
      });
      // Set empty state on error
      setArticles([]);
      setPagination({
        current_page: currentPage,
        total_pages: 1,
        total: 0,
        per_page: 9,
      });
    } finally {
      console.log("ArticlesPage - Setting isLoading to false");
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Small delay to ensure loading state is visible
      setRefreshing(false);
    }
  };

  // Fetch articles when component mounts with force refresh
  useEffect(() => {
    console.log("ArticlesPage - Component mounted, forcing refresh");
    fetchArticles(true);
  }, []);

  // Re-fetch with force refresh when search or category changes
  useEffect(() => {
    console.log("ArticlesPage - Search or category changed:", {
      search: searchQuery,
      category: selectedCategory
    });
    setCurrentPage(1); // Reset page to 1 when filters change
    fetchArticles(true); // Force refresh when filters change
  }, [searchQuery, selectedCategory]);

  // Re-fetch when page changes
  useEffect(() => {
    console.log("ArticlesPage - Page changed:", currentPage);
    fetchArticles(true); // Always force refresh when page changes
  }, [currentPage]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles(true);

    toast({
      title: "Success",
      description: "Articles data successfully updated",
    });
  };

  return (
    <Layout>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="route-transition"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isExplore ? "Explore Articles" : "My Articles"}
              </h1>
              <p className="text-muted-foreground">
                {isExplore
                  ? "Discover the latest articles and insights"
                  : "Articles you've bookmarked or liked"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="transition-all duration-300 hover:scale-105"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing || isLoading ? "animate-spin" : ""}`}
              />
              {refreshing ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop CategoryFilter with sidebar */}
          {isDesktop && (
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              className="hidden lg:block"
            />
          )}

          <div className="flex-1">
            <div className="search-and-filter-container flex items-center gap-4 mb-6">
              <SearchBar
                onSearch={handleSearch}
                className={isMobile ? "flex-1" : "w-[300px]"}
              />

              {/* Mobile & Tablet CategoryFilter - using Select component */}
              {!isDesktop && (
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  className="mobile-select-compact"
                />
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive rounded-md p-4 mb-6">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchArticles(true)} 
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="article-grid"
            >
              <ArticleGrid articles={articles} isLoading={isLoading} />
            </motion.div>

            {!isLoading && articles.length > 0 && (
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default ArticlesPage;
