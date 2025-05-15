
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
  console.log("ArticleGrid - Received articles:", articles);
  console.log("ArticleGrid - isLoading:", isLoading);
  
  if (isLoading) {
    console.log("ArticleGrid - Showing loading state");
    return <Loading text="Loading articles..." />;
  }

  // Handle the case when articles is undefined or empty
  if (!articles || articles.length === 0) {
    console.log("ArticleGrid - No articles found");
    return <Empty message="No articles found" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      {articles.map((article) => {
        console.log("ArticleGrid - Rendering article:", article);
        return (
          <ArticleCard key={article.id} article={article} />
        );
      })}
    </div>
  );
};
