import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/article/SearchBar";
import { CategoryFilter } from "@/components/article/CategoryFilter";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash, Eye, RefreshCw } from "lucide-react";
import { Article, PaginatedResponse } from "@/types";
import { articleService } from "@/services/articleService";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/utils";

// Kustom hook untuk mendeteksi tampilan desktop (diatas 1024px)
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return isDesktop;
};

const ArticleListPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 10,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  const fetchArticles = async (forceRefresh: boolean = true) => {
    setIsLoading(true);
    try {
      console.log(
        "ArticleListPage - Mengambil artikel, forceRefresh:",
        forceRefresh
      );
      console.log("ArticleListPage - Parameter:", {
        page: currentPage,
        search: searchQuery,
        category: selectedCategory,
      });

      // Konversi "all" menjadi string kosong untuk API
      const categoryParam = selectedCategory === "all" ? "" : selectedCategory;

      const response: PaginatedResponse<Article> =
        await articleService.getArticles(
          currentPage,
          searchQuery,
          categoryParam,
          forceRefresh
        );

      console.log("ArticleListPage - Artikel yang diambil:", response.data);

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
          per_page: 10,
        }
      );
    } catch (error) {
      console.error("Error mengambil artikel:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil artikel",
        variant: "destructive",
      });
      setArticles([]);
      setPagination({
        current_page: currentPage,
        total_pages: 1,
        total: 0,
        per_page: 10,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("ArticleListPage - Komponen dimuat, memaksa refresh");
    fetchArticles(true);
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory !== undefined) {
      console.log("ArticleListPage - Pencarian atau kategori berubah:", {
        searchQuery,
        selectedCategory,
      });
      setCurrentPage(1);
      fetchArticles(true);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    console.log("ArticleListPage - Halaman berubah:", currentPage);
    fetchArticles(true); // Always force refresh when page changes
  }, [currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log("ArticleListPage - Kategori dipilih:", categoryId);
    setSelectedCategory(categoryId);
  };

  const handlePageChange = (page: number) => {
    console.log(
      "ArticleListPage - handlePageChange dipanggil dengan halaman:",
      page
    );
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleRefresh = async () => {
    console.log("Tombol refresh artikel ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchArticles(true);

    toast({
      title: "Berhasil",
      description: "Data artikel berhasil diperbarui",
    });
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await articleService.deleteArticle(id);
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dihapus",
      });

      await fetchArticles(true);
    } catch (error) {
      console.error("Error menghapus artikel:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus artikel",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Artikel</h1>
          <p className="text-muted-foreground">Kelola artikel Anda</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memuat..." : "Refresh"}
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/articles/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Artikel Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-[160px]">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Cari artikel..."
            className="mb-4 w-full"
          />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            className="w-full"
          />
        </div>

        <div className="flex-1">
          {isLoading ? (
            <Loading />
          ) : !articles || articles.length === 0 ? (
            <Empty message="Tidak ada artikel yang ditemukan" />
          ) : (
            <div className="bg-card border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Judul</TableHead>
                      <TableHead className="w-[25%]">Kategori</TableHead>
                      <TableHead className="hidden sm:table-cell w-[25%]">
                        Dibuat
                      </TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          {article.category_name || "Tanpa Kategori"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatDate(article.created_at)}
                        </TableCell>
                        <TableCell className="text-right p-0 pr-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8"
                            >
                              <Link
                                to={`/articles/${article.id}`}
                                target="_blank"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Lihat</span>
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8"
                            >
                              <Link to={`/admin/articles/edit/${article.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Artikel
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus artikel
                                    ini? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteArticle(article.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ArticleListPage;
