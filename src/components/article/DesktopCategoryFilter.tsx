
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { CategoryList } from "@/components/article/CategoryList";
import { cn } from "@/lib/utils";

interface DesktopCategoryFilterProps {
  className?: string;
  selectedCategory: string;
  categories: any[];
  isLoading: boolean;
  refreshing: boolean;
  onCategoryClick: (categoryId: string) => void;
  onRefresh: () => void;
}

export const DesktopCategoryFilter: React.FC<DesktopCategoryFilterProps> = ({
  className,
  selectedCategory,
  categories,
  isLoading,
  refreshing,
  onCategoryClick,
  onRefresh
}) => {
  return (
    <div className={cn("w-60 hidden lg:block", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg">Kategori</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <Separator className="mb-4" />
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryClick={onCategoryClick}
          isLoading={isLoading}
        />
      </ScrollArea>
    </div>
  );
};
