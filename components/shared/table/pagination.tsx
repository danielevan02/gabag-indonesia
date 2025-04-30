'use client'

import React from "react";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger} from "@/components/ui/select";

interface TablePaginationProps<TData>{
  table: Table<TData>
}

const TablePagination = <TData,>({table}: TablePaginationProps<TData>) => {
  
  const rows = [
    {value: 15, label: '15'},
    {value: 30, label: '30'},
    {value: 50, label: '50'},
  ] 

  return (
    <Pagination>
      <Select onValueChange={(val)=>{
        const size = Number(val) ?? 15
        table.setPageSize(size)
       }}
      >
        <SelectTrigger className="border rounded-lg p-1 w-fit mr-5 text-sm text-neutral-500 pl-2">
          {table.getState().pagination.pageSize}
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
          <Button className="flex text-sm" variant='ghost' onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <IconChevronLeft/>
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <div className="flex text-sm text-neutral-600 gap-2">
            <div>
              <span>
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>
              -
              <span>
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getRowCount()
                )}
              </span>
            </div>
            of
            <span>{table.getRowCount().toLocaleString()}</span>
          </div>
        </PaginationItem>
        <PaginationItem>
          <Button className="flex text-sm" variant='ghost' onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()} >
            Next
            <IconChevronRight/>
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;