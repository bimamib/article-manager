
import { useState, useEffect } from "react";
import { Category } from "@/types";
import { categoryService } from "@/services/categoryService";
import { useToast } from "@/components/ui/use-toast";

export const useCategories = (initialRefresh: boolean = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchCategories = async (forceRefresh: boolean = true) => {
    try {
      setIsLoading(true);
      console.log("useCategories - Memulai pengambilan kategori, forceRefresh:", forceRefresh);
      
      // Mengambil langsung dari localStorage untuk performa
      const localCategories = JSON.parse(localStorage.getItem('localCategories') || '[]');
      
      if (localCategories && Array.isArray(localCategories) && localCategories.length > 0) {
        console.log("useCategories - Menggunakan kategori dari localStorage:", localCategories);
        setCategories(localCategories);
      } else {
        // Jika tidak ada di localStorage, paksa refresh dari API
        console.log("useCategories - Tidak ada data di localStorage, mengambil dari API");
        const fetchedCategories = await categoryService.getAllCategories(true);
        
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
          console.log("useCategories - Berhasil mengambil kategori dari API:", fetchedCategories);
        } else {
          console.error("Format data kategori tidak valid:", fetchedCategories);
          setCategories([]);
          toast({
            title: "Peringatan",
            description: "Format data kategori tidak valid",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error saat mengambil kategori:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil kategori",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch categories saat komponen dimuat
  useEffect(() => {
    if (initialRefresh) {
      console.log("useCategories - Komponen dimuat, memaksa refresh");
      fetchCategories(true);
    }
  }, [initialRefresh]);

  const handleRefresh = async () => {
    console.log("Tombol refresh kategori ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchCategories(true);
    
    toast({
      title: "Berhasil",
      description: "Data kategori berhasil diperbarui"
    });
  };

  return {
    categories,
    isLoading,
    refreshing,
    handleRefresh
  };
};
