
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationInfo } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  className,
}) => {
  const isMobile = useIsMobile();

  // Return null if pagination is undefined or incomplete
  if (
    !pagination ||
    pagination.total_pages === undefined ||
    pagination.current_page === undefined
  ) {
    return null;
  }

  const { current_page, total_pages } = pagination;

  const handlePageChange = (page: number) => {
    console.log("PaginationControls - Attempting to change page to:", page);
    
    if (page < 1 || page > total_pages) {
      console.log("PaginationControls - Invalid page:", page);
      return;
    }

    if (page === current_page) {
      console.log("PaginationControls - Already on page:", page);
      return;
    }

    console.log("PaginationControls - Calling onPageChange with page:", page);
    onPageChange(page);
  };

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = isMobile ? 3 : 5;

    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (total_pages <= 1) return null;

  // Use 'xs' for mobile to make buttons smaller
  const buttonSize = isMobile ? "xs" : "icon";

  // Use a consistent button class for mobile to ensure same size
  const mobileButtonClass = isMobile ? "!h-7 !w-7 min-w-7 p-0 rounded-lg" : "";

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 mt-6 theme-transition", 
        className
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(1)}
          disabled={current_page === 1}
          className={cn(mobileButtonClass, "transition-all duration-300 hover:scale-105")}
        >
          <ChevronsLeft className="h-3 w-3" />
          <span className="sr-only">First Page</span>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className={cn(mobileButtonClass, "transition-all duration-300 hover:scale-105")}
        >
          <ChevronLeft className="h-3 w-3" />
          <span className="sr-only">Previous Page</span>
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={current_page === page ? "default" : "outline"}
            size={buttonSize}
            onClick={() => handlePageChange(page)}
            className={cn(
              mobileButtonClass, 
              "font-medium transition-all duration-300",
              current_page === page ? "transform scale-110" : "hover:scale-105"
            )}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === total_pages}
          className={cn(mobileButtonClass, "transition-all duration-300 hover:scale-105")}
        >
          <ChevronRight className="h-3 w-3" />
          <span className="sr-only">Next Page</span>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(total_pages)}
          disabled={current_page === total_pages}
          className={cn(mobileButtonClass, "transition-all duration-300 hover:scale-105")}
        >
          <ChevronsRight className="h-3 w-3" />
          <span className="sr-only">Last Page</span>
        </Button>
      </div>
    </div>
  );
};
