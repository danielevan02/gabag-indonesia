"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import ModalContent from "./modal-content";
import TablePagination from "./pagination";
import { Loader, Truck } from "lucide-react";
import { usePathname } from "next/navigation";

interface DeleteManyMutation {
  mutate: (params: { ids: string[] }) => void;
  isPending?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder: string;
  deleteManyMutation?: DeleteManyMutation;
  deleteTitle?: string;
  searchColumn?: string;
  bulkShipmentAction?: (orderIds: string[]) => void;
  isBulkShipmentPending?: boolean;
  // Server-side pagination props (optional)
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export function   DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  deleteManyMutation,
  deleteTitle,
  searchColumn,
  bulkShipmentAction,
  isBulkShipmentPending = false,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
}: DataTableProps<TData, TValue>) {
  const [openModal, setOpenModal] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const path = usePathname()

  // Check if using server-side pagination
  const isServerSide = totalCount !== undefined && currentPage !== undefined;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize || 15,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Only use client-side pagination if not server-side
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    // For server-side pagination, we need to control the row count manually
    manualPagination: isServerSide,
    pageCount: isServerSide ? totalPages : undefined,
    rowCount: isServerSide ? totalCount : undefined,
    state: {
      pagination,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.length;

  // Find the first searchable column if searchColumn is not provided
  const getSearchableColumn = () => {
    if (searchColumn) {
      const column = table.getColumn(searchColumn);
      if (column) {
        return column;
      } else {
        console.warn(`Specified search column '${searchColumn}' does not exist`);
      }
    }

    // Try common column names
    const commonColumnNames = ["name", "title", "id", "email", "code"];
    for (const columnName of commonColumnNames) {
      const column = table.getColumn(columnName);
      if (column) return column;
    }

    // Return first filterable column if no common names found
    return table.getAllColumns().find((col) => col.getCanFilter());
  };

  const searchableColumn = getSearchableColumn();

  const handleManyDelete = () => {
    if (selectedRows === 0 || !deleteManyMutation) return;
    const rows = table.getFilteredSelectedRowModel().rows.map((item) => item.original);
    //@ts-expect-error there is no id in TData
    const selectedIds = rows.map((row) => row.id);

    deleteManyMutation.mutate({ ids: selectedIds });
    table.resetRowSelection(true);
    setOpenModal(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (searchableColumn) {
      // Use specific column filter
      try {
        searchableColumn.setFilterValue(value);
      } catch (error) {
        console.warn("Error setting column filter, falling back to global filter:", error);
        setGlobalFilter(value);
      }
    } else {
      // Fallback to global filter
      setGlobalFilter(value);
    }
  };

  const getSearchValue = () => {
    if (searchableColumn) {
      try {
        return (searchableColumn.getFilterValue() as string) || "";
      } catch (error) {
        console.warn("Error getting column filter value:", error);
        return globalFilter;
      }
    }
    return globalFilter;
  };

  return (
    <>
      <div className="flex w-full justify-between items-center my-5">
        <div className="relative w-1/2 lg:w-1/4 shrink-0 flex items-center">
          <IconSearch className="absolute right-2 text-neutral-400" size={18} />
          <Input
            placeholder={searchPlaceholder}
            className="pr-10"
            value={getSearchValue()}
            onChange={handleSearchChange}
          />
        </div>

        {/* Bulk Actions */}
        {(deleteManyMutation || bulkShipmentAction) && (
          <div
            className={cn(
              "opacity-0 transition-all pointer-events-none flex items-center gap-2",
              selectedRows !== 0 && "opacity-100 pointer-events-auto"
            )}
          >
            {path === "/admin/order" && bulkShipmentAction && (
              <Button
                onClick={() => {
                  const rows = table.getFilteredSelectedRowModel().rows.map((item) => item.original);
                  //@ts-expect-error there is no id in TData
                  const selectedIds = rows.map((row) => row.id);
                  bulkShipmentAction(selectedIds);
                }}
                disabled={isBulkShipmentPending}
              >
                {isBulkShipmentPending ? (
                  <>
                    <Loader className="animate-spin size-4" />
                    Creating Shipment...
                  </>
                ) : (
                  <>
                    <Truck />
                    Create Shipment for {`${selectedRows} order(s)`}
                  </>
                )}
              </Button>
            )}
            {deleteManyMutation && (
              <Button variant="destructive" onClick={() => setOpenModal(true)}>
                <IconTrash />
                Delete {`${selectedRows} row(s)`}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border relative overflow-y-auto flex-1">
        {/* IF YOU SEARCHING FOR TABLE HEADER STICKY, MAKE SURE YOU ADD "h-full" TO THE shadcn TABLE COMPONENT */}
        <Table>
          <TableHeader className="sticky top-0 bg-white shadow shadow-neutral-200 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center mt-5">
        <TablePagination
          table={table}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      </div>

      {deleteManyMutation && (
        <ModalContent
          button="Delete"
          icon={IconTrash}
          onClick={handleManyDelete}
          openModal={openModal}
          setOpenModal={setOpenModal}
          desc="Are you sure you want to delete the selected rows? this action cannot be undone."
          title={deleteTitle ?? "Delete"}
        />
      )}
    </>
  );
}
