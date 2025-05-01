
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
  const { toast } = useToast();

  const fetchCategories = async (forceRefresh: boolean = true) => {
    try {
      setIsLoading(true);
      console.log("CategoryFilter - Memulai pengambilan kategori, forceRefresh:", forceRefresh);
      
      // Mengambil dari API untuk memastikan data terbaru
      const fetchedCategories = await categoryService.getAllCategories(forceRefresh);
      
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
        console.log("CategoryFilter - Berhasil mengambil kategori:", fetchedCategories);
      } else {
        console.error("Format data kategori tidak valid:", fetchedCategories);
        setCategories([]);
        toast({
          title: "Peringatan",
          description: "Format data kategori tidak valid",
          variant: "destructive",
        });
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
    console.log("Kategori dipilih:", categoryId);
    onSelectCategory(categoryId);
    setSheetOpen(false);
  };
  
  const handleRefresh = async () => {
    console.log("Tombol refresh kategori ditekan, memaksa refresh data");
    setRefreshing(true);
    await fetchCategories(true);
    
    toast({
      title: "Berhasil",
      description: "Data kategori berhasil diperbarui"
    });
  };

  const categoryButtons = (
    <div className="space-y-1">
      <Button
        variant={selectedCategory === "" ? "default" : "ghost"}
        className="w-full justify-start text-sm"
        onClick={() => handleCategoryClick("")}
      >
        Semua Kategori
      </Button>
      {Array.isArray(categories) && categories.length > 0 ? (
        categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className="w-full justify-start text-sm"
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))
      ) : (
        !isLoading && (
          <div className="text-sm text-muted-foreground p-2 text-center">
            Tidak ada kategori tersedia
          </div>
        )
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className={cn("flex items-center gap-2", className)}>
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] p-0">
          <div className="p-6">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center justify-between">
                <span>Kategori</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSheetOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetTitle>
            </SheetHeader>
            <Separator className="mb-4" />
            <ScrollArea className="h-[calc(100vh-8rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-sm text-muted-foreground">Memuat...</p>
                </div>
              ) : (
                categoryButtons
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn("w-[140px] hidden md:block", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg">Kategori</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
