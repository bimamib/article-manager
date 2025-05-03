import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Category } from "@/types";
import { categoryService } from "@/services/categoryService";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tentukan breakpoint untuk desktop (diatas 1024px)
const DESKTOP_BREAKPOINT = 1024;

// Hook kustom untuk mendeteksi apakah layar tablet atau lebih kecil
const useIsTabletOrMobile = () => {
  const [isTabletOrMobile, setIsTabletOrMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return isTabletOrMobile;
};

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const isTabletOrMobile = useIsTabletOrMobile();
  const { toast } = useToast();

  const fetchCategories = async (forceRefresh: boolean = true) => {
    try {
      setIsLoading(true);
      console.log(
        "CategoryFilter - Memulai pengambilan kategori, forceRefresh:",
        forceRefresh
      );

      // Mengambil langsung dari localStorage untuk performa
      const localCategories = JSON.parse(
        localStorage.getItem("localCategories") || "[]"
      );

      if (
        localCategories &&
        Array.isArray(localCategories) &&
        localCategories.length > 0
      ) {
        console.log(
          "CategoryFilter - Menggunakan kategori dari localStorage:",
          localCategories
        );
        setCategories(localCategories);
      } else {
        // Jika tidak ada di localStorage, paksa refresh dari API
        console.log(
          "CategoryFilter - Tidak ada data di localStorage, mengambil dari API"
        );
        const fetchedCategories = await categoryService.getAllCategories(true);

        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
          console.log(
            "CategoryFilter - Berhasil mengambil kategori dari API:",
            fetchedCategories
          );
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

  // Fetch categories langsung saat komponen dimuat
  useEffect(() => {
    console.log("CategoryFilter - Komponen dimuat, memaksa refresh");
    fetchCategories(true);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setSheetOpen(false);
  };

  const handleRefresh = async () => {
    console.log("Tombol refresh kategori ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchCategories(true);

    toast({
      title: "Berhasil",
      description: "Data kategori berhasil diperbarui",
    });
  };

  const categoryButtons = (
    <div className="space-y-1">
      <Button
        variant={selectedCategory === "all" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleCategoryClick("all")}
      >
        Semua Kategori
      </Button>
      {Array.isArray(categories) && categories.length > 0
        ? categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))
        : !isLoading && (
            <div className="text-sm text-muted-foreground p-2 text-center">
              Tidak ada kategori tersedia
            </div>
          )}
    </div>
  );

  // Render Select untuk tampilan mobile dan tablet
  if (isTabletOrMobile) {
    return (
      <div className={cn("w-full", className)}>
        <Select
          value={selectedCategory || "all"}
          onValueChange={handleCategoryClick}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full max-w-[250px]">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent className="max-w-[250px]">
            <SelectItem value="all">Semua</SelectItem>
            {Array.isArray(categories) && categories.length > 0
              ? categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name.length > 20
                      ? `${category.name.substring(0, 20)}...`
                      : category.name}
                  </SelectItem>
                ))
              : !isLoading && (
                  <div className="text-sm text-muted-foreground p-2 text-center">
                    Tidak ada kategori tersedia
                  </div>
                )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Render tampilan desktop (sidebar)
  return (
    <div className={cn("w-[160px] hidden lg:block", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg">Kategori</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
      <Separator className="mb-4" />
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {categoryButtons}
        </ScrollArea>
      )}
    </div>
  );
};
