import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page

    // If total pages is small enough, show all pages
    if (totalPages <= delta * 2 + 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const rangeWithDots = [];

    // Always show first page
    rangeWithDots.push(1);

    // Calculate the start and end of the middle section
    let startPage = Math.max(2, currentPage - delta);
    let endPage = Math.min(totalPages - 1, currentPage + delta);

    // Ensure we show at least delta*2+1 pages in the middle section when possible
    const middleSectionSize = endPage - startPage + 1;
    const targetSize = delta * 2 + 1;

    if (middleSectionSize < targetSize) {
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + targetSize - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - targetSize + 1);
      }
    }

    if (startPage > 2) {
      rangeWithDots.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      rangeWithDots.push(i);
    }

    if (endPage < totalPages - 1) {
      rangeWithDots.push("...");
    }

    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2 mt-8"
      data-testid="pagination"
    >
      <Button
        variant="outline"
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
        data-testid="pagination-previous"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-1" data-testid="pagination-pages">
        {getVisiblePages().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 py-1 text-brand-gray-50"
                data-testid="pagination-ellipsis"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => onPageChange(page as number)}
              className="w-8 h-8 p-0"
              data-testid={`pagination-page-${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
        data-testid="pagination-next"
      >
        Next
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
