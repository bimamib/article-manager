
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
  if (isLoading) {
    return <Loading />;
  }

  // Handle the case when articles is undefined or empty
  if (!articles || articles.length === 0) {
    return <Empty message="Tidak ada artikel yang ditemukan" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
