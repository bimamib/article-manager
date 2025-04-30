
import React from "react";
import { ArticleCard } from "./ArticleCard";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { Article } from "@/types";

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  isLoading,
}) => {
  // Check if we're on tablet view
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  if (isLoading) {
    return <Loading />;
  }

  // Handle the case when articles is undefined
  if (!articles || articles.length === 0) {
    return <Empty message="Tidak ada artikel yang ditemukan" />;
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 ${
      isTablet ? 'sm:grid-cols-1 md:grid-cols-2' : ''
    }`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
