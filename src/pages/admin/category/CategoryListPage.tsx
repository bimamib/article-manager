
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/article/SearchBar";
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
import { PlusCircle, Edit, Trash } from "lucide-react";
import { Category, PaginatedResponse } from "@/types";
import { categoryService } from "@/services/categoryService";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 10,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response: PaginatedResponse<Category> = await categoryService.getCategories(
          currentPage,
          searchQuery
        );
        setCategories(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [currentPage, searchQuery, toast]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(category => category.id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      // Reload categories if the current page might be empty after deletion
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage your article categories
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/categories/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search categories..."
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <Empty message="No categories found" />
      ) : (
        <div className="bg-card border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{formatDate(category.created_at)}</TableCell>
                  <TableCell>{formatDate(category.updated_at)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link to={`/admin/categories/edit/${category.id}`}>
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
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
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
    </Layout>
  );
};

export default CategoryListPage;
