
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCategoryFilter } from "@/components/article/MobileCategoryFilter";
import { DesktopCategoryFilter } from "@/components/article/DesktopCategoryFilter";
import { useCategories } from "@/hooks/useCategories";

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
  const isMobile = useIsMobile();
  const { categories, isLoading, refreshing, handleRefresh } = useCategories();

  // For mobile and tablet
  if (isMobile || window.innerWidth < 1024) {
    return (
      <MobileCategoryFilter
        className={className}
        selectedCategory={selectedCategory}
        categories={categories}
        isLoading={isLoading}
        refreshing={refreshing}
        onCategoryClick={onSelectCategory}
        onRefresh={handleRefresh}
      />
    );
  }

  // For desktop
  return (
    <DesktopCategoryFilter
      className={className}
      selectedCategory={selectedCategory}
      categories={categories}
      isLoading={isLoading}
      refreshing={refreshing}
      onCategoryClick={onSelectCategory}
      onRefresh={handleRefresh}
    />
  );
};
