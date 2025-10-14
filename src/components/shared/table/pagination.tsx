'use client'

import React from "react";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface TablePaginationProps<TData>{
  table: Table<TData>;
  // Server-side pagination props (optional)
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

const TablePagination = <TData,>({
  table,
  totalCount,
  currentPage,
  totalPages,
  pageSize
}: TablePaginationProps<TData>) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rows = [
    {value: 15, label: '15'},
    {value: 30, label: '30'},
    {value: 50, label: '50'},
  ];

  // Check if using server-side pagination
  const isServerSide = totalCount !== undefined && currentPage !== undefined;

  const handlePageChange = (newPage: number) => {
    if (!isServerSide) {
      // Client-side pagination
      if (newPage === currentPage + 1) {
        table.nextPage();
      } else {
        table.previousPage();
      }
      return;
    }

    // Server-side pagination - update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (val: string) => {
    const size = Number(val) ?? 15;

    if (!isServerSide) {
      // Client-side pagination
      table.setPageSize(size);
      return;
    }

    // Server-side pagination - update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", size.toString());
    params.set("page", "1"); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  // Calculate display values
  const displayPageSize = isServerSide ? pageSize! : table.getState().pagination.pageSize;
  const displayTotalCount = isServerSide ? totalCount! : table.getRowCount();
  const displayCurrentPage = isServerSide ? currentPage! : table.getState().pagination.pageIndex + 1;
  const displayTotalPages = isServerSide ? totalPages! : table.getPageCount();

  const startRow = (displayCurrentPage - 1) * displayPageSize + 1;
  const endRow = Math.min(displayCurrentPage * displayPageSize, displayTotalCount);

  const canPreviousPage = displayCurrentPage > 1;
  const canNextPage = displayCurrentPage < displayTotalPages;

  return (
    <Pagination>
      <Select onValueChange={handleLimitChange} value={displayPageSize.toString()}>
        <SelectTrigger className="border rounded-lg p-1 w-fit mr-5 text-sm text-neutral-500 pl-2">
          {displayPageSize}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Rows Per Page</SelectLabel>
            {rows.map((option, idx) => (
              <SelectItem key={idx} value={option.value.toString()}>{option.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <PaginationContent className="w-fit gap-3">
        <PaginationItem>
          <Button
            className="flex text-sm"
            variant='ghost'
            onClick={() => handlePageChange(displayCurrentPage - 1)}
            disabled={!canPreviousPage}
          >
            <IconChevronLeft/>
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <div className="flex text-sm text-neutral-600 gap-2">
            <div>
              <span>{startRow}</span>
              -
              <span>{endRow}</span>
            </div>
            of
            <span>{displayTotalCount.toLocaleString()}</span>
          </div>
        </PaginationItem>
        <PaginationItem>
          <Button
            className="flex text-sm"
            variant='ghost'
            onClick={() => handlePageChange(displayCurrentPage + 1)}
            disabled={!canNextPage}
          >
            Next
            <IconChevronRight/>
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;