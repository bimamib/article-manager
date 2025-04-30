
import React from "react";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
  isLoading: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onCategoryClick,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button
        variant={selectedCategory === "" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onCategoryClick("")}
      >
        Semua Kategori
      </Button>
      
      {Array.isArray(categories) && categories.length > 0 ? (
        categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))
      ) : (
        <div className="text-sm text-muted-foreground p-2 text-center">
          Tidak ada kategori tersedia
        </div>
      )}
    </div>
  );
};
