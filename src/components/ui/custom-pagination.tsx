import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  siblings?: number;
  showControls?: boolean;
  showEdges?: boolean;
}

export function CustomPagination({
  page,
  total,
  onChange,
  siblings = 1,
  showControls = true,
  showEdges = true,
}: CustomPaginationProps) {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const renderPagination = () => {
    const items: (number | "ellipsis")[] = [];

    if (total <= 7) {
      items.push(...range(1, total));
    } else {
      const leftSibling = Math.max(page - siblings, 1);
      const rightSibling = Math.min(page + siblings, total);

      const shouldShowLeftDots = leftSibling > 2;
      const shouldShowRightDots = rightSibling < total - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        items.push(...range(1, 5));
        items.push("ellipsis");
        items.push(total);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        items.push(1);
        items.push("ellipsis");
        items.push(...range(total - 4, total));
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        items.push(1);
        items.push("ellipsis");
        items.push(...range(leftSibling, rightSibling));
        items.push("ellipsis");
        items.push(total);
      }
    }

    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        {showControls && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onChange(page - 1);
              }}
            />
          </PaginationItem>
        )}

        {renderPagination().map((item, index) => (
          <PaginationItem key={index}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(item);
                }}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {showControls && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < total) onChange(page + 1);
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
