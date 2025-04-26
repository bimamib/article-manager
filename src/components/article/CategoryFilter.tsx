
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
import { Filter, X } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const fetchedCategories = await categoryService.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setSheetOpen(false);
  };

  const categoryButtons = (
    <div className="space-y-1">
      <Button
        variant={selectedCategory === "" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => handleCategoryClick("")}
      >
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleCategoryClick(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw]">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center justify-between">
              Categories
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          <Separator className="mb-4" />
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              categoryButtons
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-60 hidden md:block">
      <div className="font-semibold text-lg mb-4">Categories</div>
      <Separator className="mb-4" />
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {categoryButtons}
        </ScrollArea>
      )}
    </div>
  );
};
