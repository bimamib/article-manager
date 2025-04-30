
import { useState, useEffect } from "react";
import { Article, PaginatedResponse } from "@/types";
import { articleService } from "@/services/articleService";
import { useToast } from "@/components/ui/use-toast";

interface UseArticlesResult {
  articles: Article[];
  isLoading: boolean;
  refreshing: boolean;
  pagination: {
    current_page: number;
    total_pages: number;
    total: number;
    per_page: number;
  };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleRefresh: () => Promise<void>;
}

export const useArticles = (): UseArticlesResult => {
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

      // Ambil data langsung dari localStorage untuk performa
      const localArticles = JSON.parse(
        localStorage.getItem("localArticles") || "[]"
      );

      if (
        !forceRefresh &&
        localArticles &&
        Array.isArray(localArticles) &&
        localArticles.length > 0
      ) {
        // Filter berdasarkan kategori dan pencarian
        let filteredArticles = [...localArticles]; // Create a copy to avoid reference issues

        if (selectedCategory) {
          console.log("Filtering by category ID:", selectedCategory);
          filteredArticles = filteredArticles.filter(
            (article) => article.category_id === selectedCategory
          );
        } else {
          console.log("No category filter applied, showing all articles");
        }

        if (searchQuery) {
          filteredArticles = filteredArticles.filter(
            (article) =>
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (article.content &&
                article.content
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          );
        }

        console.log("ArticlePage - Filter artikel lokal:", filteredArticles);

        // Paginate the results
        const itemsPerPage = 9;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

        setArticles(paginatedArticles);
        setPagination({
          current_page: currentPage,
          total_pages: Math.ceil(filteredArticles.length / itemsPerPage),
          total: filteredArticles.length,
          per_page: itemsPerPage,
        });
      } else {
        // Try to get from API through the service
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
      }
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
    fetchArticles(true);
  }, []);

  // Re-fetch when search or category changes
  useEffect(() => {
    console.log("ArticlePage - Pencarian atau kategori berubah:", { searchQuery, selectedCategory });
    setCurrentPage(1); // Reset to first page
    fetchArticles(true);
  }, [searchQuery, selectedCategory]);

  // Re-fetch when page changes
  useEffect(() => {
    console.log("ArticlePage - Halaman berubah:", currentPage);
    fetchArticles(false);
  }, [currentPage]);

  const handleRefresh = async () => {
    console.log("Tombol refresh ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchArticles(true);

    toast({
      title: "Berhasil",
      description: "Data artikel berhasil diperbarui",
    });
  };

  return {
    articles,
    isLoading,
    refreshing,
    pagination,
    currentPage,
    setCurrentPage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    handleRefresh,
  };
};
