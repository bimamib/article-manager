
import React from "react";
import { ArticleCard } from "./ArticleCard";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { Article } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image placeholder */}
      <div className="aspect-video w-full">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {/* Date and category row */}
        <div className="flex flex-row items-center justify-between gap-2 mb-2">
          <Skeleton className="h-3 w-24" /> {/* Date */}
          <Skeleton className="h-5 w-20 rounded-full" /> {/* Category badge */}
        </div>
        
        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-4/5 mb-4" />
        
        {/* Content excerpt */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5 mb-4" />
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex justify-between w-full">
          <Skeleton className="h-3 w-16" /> {/* Author */}
          <Skeleton className="h-3 w-16" /> {/* Read more */}
        </div>
      </div>
    </Card>
  );
};
