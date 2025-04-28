
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
import { PlusCircle, Edit, Trash, RefreshCw } from "lucide-react";
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();
  
  const fetchCategories = async (forceRefresh: boolean = true) => {
    setIsLoading(true);
    try {
      // Memaksa refresh data dari storage
      console.log("CategoryListPage - Memulai pengambilan kategori, forceRefresh:", forceRefresh);
      
      // Pertama ambil semua kategori untuk memastikan data terbaru
      const allCategories = await categoryService.getAllCategories(forceRefresh);
      console.log("CategoryListPage - Semua kategori yang diambil:", allCategories);
      
      // Gunakan data semua kategori langsung
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      let filteredCategories = allCategories;
      if (searchQuery) {
        filteredCategories = allCategories.filter(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
      
      setCategories(paginatedCategories);
      setPagination({
        current_page: currentPage,
        total_pages: Math.ceil(filteredCategories.length / itemsPerPage),
        total: filteredCategories.length,
        per_page: itemsPerPage,
      });
    } catch (error) {
      console.error("Error saat mengambil kategori:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data kategori",
        variant: "destructive",
      });
      // Set default values on error
      setCategories([]);
      setPagination({
        current_page: currentPage, // Gunakan currentPage yang ada
        total_pages: 1,
        total: 0,
        per_page: 10,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Paksa refresh ketika komponen dimuat
  useEffect(() => {
    console.log("CategoryListPage - Komponen dimuat, memaksa refresh");
    fetchCategories(true);
  }, []);
  
  // Re-fetch ketika halaman berubah
  useEffect(() => {
    console.log("CategoryListPage - Halaman berubah:", currentPage);
    fetchCategories(false);
  }, [currentPage]);

  // Re-fetch ketika pencarian berubah (tetapi reset ke halaman 1)
  useEffect(() => {
    if (searchQuery !== "") {
      console.log("CategoryListPage - Pencarian berubah:", searchQuery);
      setCurrentPage(1); // Reset halaman ke 1 ketika filter berubah
      fetchCategories(false);
    }
  }, [searchQuery]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Tidak perlu lagi mengatur currentPage di sini karena sudah di-handle dalam useEffect
  };

  const handlePageChange = (page: number) => {
    console.log("CategoryListPage - handlePageChange dipanggil dengan halaman:", page);
    setCurrentPage(page);
  };
  
  const handleRefresh = async () => {
    console.log("Tombol refresh ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchCategories(true);
    
    toast({
      title: "Berhasil",
      description: "Data kategori berhasil diperbarui",
    });
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
      
      // Refresh the list to ensure we have the latest data
      await fetchCategories(true);
    } catch (error) {
      console.error("Error saat menghapus kategori:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori artikel Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memperbarui...' : 'Refresh'}
          </Button>
          <Button asChild>
            <Link to="/admin/categories/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Kategori Baru
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Cari kategori..."
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <Empty message="Tidak ada kategori ditemukan" />
      ) : (
        <div className="bg-card border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Diperbarui</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
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
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori "{category.name}"? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
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
    </Layout>
  );
};

export default CategoryListPage;
