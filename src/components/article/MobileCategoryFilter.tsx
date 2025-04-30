
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X, RefreshCw } from "lucide-react";
import { CategoryList } from "@/components/article/CategoryList";
import { cn } from "@/lib/utils";

interface MobileCategoryFilterProps {
  className?: string;
  selectedCategory: string;
  categories: any[];
  isLoading: boolean;
  refreshing: boolean;
  onCategoryClick: (categoryId: string) => void;
  onRefresh: () => void;
}

export const MobileCategoryFilter: React.FC<MobileCategoryFilterProps> = ({
  className,
  selectedCategory,
  categories,
  isLoading,
  refreshing,
  onCategoryClick,
  onRefresh
}) => {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    setSheetOpen(false);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn("flex items-center gap-2", className)}>
          <Filter className="h-4 w-4" />
          <span>Filter Kategori</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw]">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Kategori</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
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
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            isLoading={isLoading}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
