
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ArticlePageHeaderProps {
  isExplore?: boolean;
  refreshing: boolean;
  handleRefresh: () => void;
}

export const ArticlePageHeader: React.FC<ArticlePageHeaderProps> = ({
  isExplore = false,
  refreshing,
  handleRefresh,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isExplore ? "Jelajahi Artikel" : "Artikel Saya"}
          </h1>
          <p className="text-muted-foreground">
            {isExplore
              ? "Temukan artikel dan wawasan terbaru"
              : "Artikel yang Anda bookmark atau sukai"}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Memuat..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
};
