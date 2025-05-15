
import React from "react";
import { ArticleCard } from "./ArticleCard";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { Article } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

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
    return (
      <div className="w-full py-8">
        <Loading text="Loading articles..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleGridSkeleton key={i} />
          ))}
        </div>
      </div>
    );
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

const ArticleGridSkeleton = () => {
  return (
    <div className="border rounded-md overflow-hidden h-full flex flex-col">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full mb-2" />
        <div className="flex justify-between mt-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};
