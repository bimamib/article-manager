
import React from "react";
import { ArticleGrid } from "@/components/article/ArticleGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ArticleFilterSection } from "@/components/article/ArticleFilterSection";
import { CategoryFilter } from "@/components/article/CategoryFilter";
import { Article, PaginationInfo } from "@/types";

interface ArticleContentProps {
  articles: Article[];
  isLoading: boolean;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSearch: (query: string) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  articles,
  isLoading,
  selectedCategory,
  onSelectCategory,
  onSearch,
  pagination,
  onPageChange,
  isMobile,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop CategoryFilter - only shown on desktop */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        className="hidden lg:block"
      />

      <div className="flex-1">
        <ArticleFilterSection
          isMobile={isMobile}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          onSearch={onSearch}
        />

        <ArticleGrid articles={articles} isLoading={isLoading} />

        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
