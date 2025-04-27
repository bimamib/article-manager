
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const fetchArticles = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      console.log("ArticleListPage - Mengambil artikel, forceRefresh:", forceRefresh);
      const response: PaginatedResponse<Article> = await articleService.getArticles(
        currentPage,
        searchQuery,
        selectedCategory,
        forceRefresh
      );
      console.log("ArticleListPage - Artikel yang diambil:", response.data);
      setArticles(response.data || []);
      setPagination(response.pagination || {
        current_page: 1,
        total_pages: 1,
        total: 0,
        per_page: 10,
      });
    } catch (error) {
      console.error("Error mengambil artikel:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil artikel",
        variant: "destructive",
      });
      // Set default values on error
      setArticles([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total: 0,
        per_page: 10,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch articles when component mounts with force refresh
  useEffect(() => {
    console.log("ArticleListPage - Komponen dimuat, memaksa refresh");
    fetchArticles(true);
  }, []);
  
  // Re-fetch when page, search or category changes
  useEffect(() => {
    console.log("ArticleListPage - Halaman, pencarian, atau kategori berubah");
    fetchArticles(false);
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleRefresh = async () => {
    console.log("Tombol refresh artikel ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchArticles(true);
  };
  
  const handleDeleteArticle = async (id: string) => {
    try {
      await articleService.deleteArticle(id);
      // Only filter articles if they exist
      if (articles && articles.length > 0) {
        setArticles(articles.filter(article => article.id !== id));
      }
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dihapus",
      });
      
      // Reload articles if the current page might be empty after deletion
      if (articles && articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh list after deletion to ensure consistency
        fetchArticles(true);
      }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Artikel</h1>
          <p className="text-muted-foreground">
            Kelola artikel Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </Button>
          <Button asChild>
            <Link to="/admin/articles/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Artikel Baru
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className={`${isMobile ? "w-full" : "w-60"}`}>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Cari artikel..."
            className="mb-4"
          />
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
        
        <div className="flex-1">
          {isLoading ? (
            <Loading />
          ) : !articles || articles.length === 0 ? (
            <Empty message="Tidak ada artikel yang ditemukan" />
          ) : (
            <div className="bg-card border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="hidden md:table-cell">Dibuat</TableHead>
                    <TableHead className="w-[150px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.category_name || "Tanpa Kategori"}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(article.created_at)}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/articles/${article.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Link>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/admin/articles/edit/${article.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArticle(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="p-4">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
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
