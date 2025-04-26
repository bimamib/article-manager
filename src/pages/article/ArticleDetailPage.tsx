
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Article } from "@/types";
import { articleService } from "@/services/articleService";
import { formatDate } from "@/lib/utils";

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const fetchedArticle = await articleService.getArticleById(id);
        setArticle(fetchedArticle);
        
        // Fetch related articles
        const fetchedRelatedArticles = await articleService.getRelatedArticles(
          fetchedArticle.category_id,
          id
        );
        setRelatedArticles(fetchedRelatedArticles.slice(0, 3));
      } catch (error) {
        console.error("Error fetching article data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  if (isLoading) {
    return <Layout><Loading /></Layout>;
  }

  if (!article) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            The article you are looking for does not exist.
          </p>
          <Button asChild>
            <Link to="/articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        asChild
      >
        <Link to="/articles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <div className="aspect-video overflow-hidden rounded-lg mb-6">
          <img
            src={article.image || "https://picsum.photos/seed/article/800/450"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-primary/10">
              {article.category_name || "Uncategorized"}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              {formatDate(article.created_at)}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center text-muted-foreground text-sm">
            <span>By Admin</span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="article-content">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <Separator className="mb-6" />
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
};

export default ArticleDetailPage;
