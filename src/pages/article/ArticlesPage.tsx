
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { ArticlePageHeader } from "@/components/article/ArticlePageHeader";
import { ArticleContent } from "@/components/article/ArticleContent";
import { useArticles } from "@/hooks/useArticles";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticlesPageProps {
  isExplore?: boolean;
}

const ArticlesPage: React.FC<ArticlesPageProps> = ({ isExplore = false }) => {
  const {
    articles,
    isLoading,
    refreshing,
    pagination,
    currentPage,
    setCurrentPage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    handleRefresh,
  } = useArticles();
  
  const isMobile = useIsMobile();

  const handleCategorySelect = (categoryId: string) => {
    console.log("ArticlePage - Kategori dipilih:", categoryId);
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    console.log(
      "ArticlePage - handlePageChange dipanggil dengan halaman:",
      page
    );
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Layout>
      <ArticlePageHeader 
        isExplore={isExplore} 
        refreshing={refreshing} 
        handleRefresh={handleRefresh} 
      />
      
      <ArticleContent
        articles={articles}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onSearch={handleSearch}
        pagination={pagination}
        onPageChange={handlePageChange}
        isMobile={isMobile}
      />
    </Layout>
  );
};

export default ArticlesPage;
