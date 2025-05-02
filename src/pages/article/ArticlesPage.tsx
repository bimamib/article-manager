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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchArticles = async (forceRefresh: boolean = true) => {
    setIsLoading(true);
    try {
      console.log(
        "ArticlePage - Memulai pengambilan artikel, forceRefresh:",
        forceRefresh
      );
      console.log("ArticlePage - Parameter:", {
        page: currentPage,
        search: searchQuery,
        category: selectedCategory,
      });

      // Always get from API through the service when filters change
      const response: PaginatedResponse<Article> =
        await articleService.getArticles(
          currentPage,
          searchQuery,
          selectedCategory,
          forceRefresh
        );

      console.log("ArticlePage - Artikel yang diambil:", response.data);

      // Pastikan data artikel adalah array
      if (Array.isArray(response.data)) {
        setArticles(response.data);
      } else {
        console.error("Format data artikel tidak valid:", response.data);
        setArticles([]);
        toast({
          title: "Peringatan",
          description: "Format data artikel tidak valid",
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
      console.error("Error mengambil artikel:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil artikel",
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
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch articles when component mounts with force refresh
  useEffect(() => {
    console.log("ArticlePage - Komponen dimuat, memaksa refresh");
    fetchArticles(true); // Selalu paksa refresh saat komponen dimuat
  }, []);

  // Re-fetch with force refresh when search or category changes
  useEffect(() => {
    console.log("ArticlePage - Pencarian atau kategori berubah");
    setCurrentPage(1); // Reset page to 1 when filters change
    fetchArticles(true); // Force refresh when filters change
  }, [searchQuery, selectedCategory]);

  // Re-fetch when page changes
  useEffect(() => {
    console.log("ArticlePage - Halaman berubah:", currentPage);
    fetchArticles(true); // Always force refresh when page changes
  }, [currentPage]);

  const handleCategorySelect = (categoryId: string) => {
    console.log("ArticlePage - Kategori dipilih:", categoryId);
    // Convert "all" value back to empty string for API calls
    setSelectedCategory(categoryId === "all" ? "" : categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    console.log(
      "ArticlePage - handlePageChange dipanggil dengan halaman:",
      page
    );
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleRefresh = async () => {
    console.log("Tombol refresh ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchArticles(true);

    toast({
      title: "Berhasil",
      description: "Data artikel berhasil diperbarui",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isExplore ? "Jelajahi Artikel" : "Artikel Saya"}
            </h1>
            <p className="text-muted-foreground">
              {isExplore
                ? "Temukan artikel dan wawasan terbaru"
                : "Artikel yang Anda bookmark atau sukai"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Desktop CategoryFilter with narrower width to match sidebar */}
        <CategoryFilter
          selectedCategory={selectedCategory || "all"}
          onSelectCategory={handleCategorySelect}
          className="hidden md:block"
        />

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <SearchBar
              onSearch={handleSearch}
              className={isMobile ? "w-full" : "w-[300px]"}
            />

            {/* Mobile CategoryFilter - now uses Select component */}
            {isMobile && (
              <CategoryFilter
                selectedCategory={selectedCategory || "all"}
                onSelectCategory={handleCategorySelect}
                className="w-full"
              />
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
