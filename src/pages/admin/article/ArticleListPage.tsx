
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
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
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
        toast({
          title: "Error",
          description: "Failed to fetch articles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, searchQuery, selectedCategory, toast]);
  
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
  };
  
  const handleDeleteArticle = async (id: string) => {
    try {
      await articleService.deleteArticle(id);
      setArticles(articles.filter(article => article.id !== id));
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      
      // Reload articles if the current page might be empty after deletion
      if (articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Articles</h1>
          <p className="text-muted-foreground">
            Manage your articles
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className={`${isMobile ? "w-full" : "w-60"}`}>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search articles..."
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
          ) : articles.length === 0 ? (
            <Empty message="No articles found" />
          ) : (
            <div className="bg-card border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.category_name || "Uncategorized"}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(article.created_at)}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/articles/${article.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
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
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this article? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArticle(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
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
