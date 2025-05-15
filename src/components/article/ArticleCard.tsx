
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Get category name from either category_name or category.name
  const categoryName = article.category_name || 
                      (article.category && article.category.name) || 
                      "Uncategorized";

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <Link to={`/articles/${article.id}`} className="group">
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image || "https://picsum.photos/seed/article/800/450"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="pt-4 pb-2 flex-grow">
          <div className="flex flex-row items-center justify-between gap-2 mb-2">
            <div className="text-xs text-muted-foreground flex items-center whitespace-nowrap">
              <CalendarDays className="h-3 w-3 mr-1" />
              {formatDate(article.created_at)}
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 hover:bg-primary/20 whitespace-nowrap ml-auto"
            >
              {categoryName}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 text-justify">
            {article.excerpt || article.content.substring(0, 150) + "..."}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="pt-0 pb-4">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>By Admin</span>
          <Link
            to={`/articles/${article.id}`}
            className="text-primary hover:underline"
          >
            Read more
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
