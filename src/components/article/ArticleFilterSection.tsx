
import React from "react";
import { CategoryFilter } from "@/components/article/CategoryFilter";
import { SearchBar } from "@/components/article/SearchBar";

interface ArticleFilterSectionProps {
  isMobile: boolean;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSearch: (query: string) => void;
}

export const ArticleFilterSection: React.FC<ArticleFilterSectionProps> = ({
  isMobile,
  selectedCategory,
  onSelectCategory,
  onSearch,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <SearchBar
        onSearch={onSearch}
        className={isMobile ? "w-full" : "w-full sm:w-[300px]"}
      />

      {/* Mobile CategoryFilter - shown on mobile and tablet */}
      {(!isMobile || window.innerWidth < 1024) && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          className="w-full lg:hidden"
        />
      )}
    </div>
  );
};
