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
    console.log("PaginationControls - Mencoba mengubah halaman ke:", page);
    console.log("PaginationControls - Validasi:", {
      currentPage: current_page,
      totalPages: total_pages,
      isValid: !(page < 1 || page > total_pages || page === current_page),
    });

    if (page < 1 || page > total_pages) {
      console.log("PaginationControls - Halaman tidak valid:", page);
      return;
    }

    if (page === current_page) {
      console.log("PaginationControls - Sudah di halaman yang sama:", page);
      return;
    }

    console.log(
      "PaginationControls - Memanggil onPageChange dengan halaman:",
      page
    );
    onPageChange(page);
  };

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 3;

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
  const mobileButtonClass = isMobile ? "!h-9 !w-9 min-w-9 p-0 rounded-lg" : "";

  return (
    <div
      className={cn("flex items-center justify-center gap-1 mt-6", className)}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(1)}
          disabled={current_page === 1}
          className={mobileButtonClass}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First Page</span>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className={mobileButtonClass}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={current_page === page ? "default" : "outline"}
            size={buttonSize}
            onClick={() => handlePageChange(page)}
            className={cn(mobileButtonClass, "font-medium")}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === total_pages}
          className={mobileButtonClass}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => handlePageChange(total_pages)}
          disabled={current_page === total_pages}
          className={mobileButtonClass}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last Page</span>
        </Button>
      </div>
    </div>
  );
};
