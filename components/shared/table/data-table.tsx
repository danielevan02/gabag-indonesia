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

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ModalContent from "./modal-content";
import TablePagination from "./pagination";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder: string;
  deleteManyFn: (ids: string[])=>Promise<unknown>
  deleteTitle?: string
}

export function DataTable<TData, TValue>({ columns, data, searchPlaceholder, deleteManyFn, deleteTitle }: DataTableProps<TData, TValue>) {
  const [openModal, setOpenModal] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const mutation = useMutation({
    mutationFn: (selectedId: string[]) => deleteManyFn(selectedId)
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15
  })
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state:{
      pagination,
      rowSelection
    }
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.length

  const handleManyDelete = () => {
    if(selectedRows === 0) return
    const rows = table.getFilteredSelectedRowModel().rows.map((item) => item.original)
    //@ts-expect-error there is no id in TData
    const selectedId = rows.map((row) => row.id)
    try {
      mutation.mutate(selectedId, {
        onSuccess: () => {
          toast.success(`Success delete ${selectedRows} rows`)
          setOpenModal(false)
        },
        onError: (error) => console.log(error)
      })
      table.resetRowSelection(true)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="flex w-full px-1 mb-3 mt-8 justify-between items-center">
        <div className="relative w-1/2 lg:w-1/4 shrink-0 flex items-center">
          <IconSearch className="absolute right-2 text-neutral-400" size={18} />
          <Input
            placeholder={searchPlaceholder}
            className="pr-10"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          />
        </div>
        
        <Button 
          variant='destructive' 
          className={cn("opacity-0 transition-all pointer-events-none",
            selectedRows !== 0 && 'opacity-100 pointer-events-auto'
          )}
          onClick={()=>setOpenModal(true)}
        >
          <IconTrash/>
          Delete {`${selectedRows} row(s)`}
        </Button>
      </div>

      <div className="rounded-md border relative overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white shadow shadow-neutral-200 z-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

      <div className="mt-5 mb-1 flex items-center justify-center">
        <TablePagination table={table}/>
      </div>

      <ModalContent
        button="Delete"
        icon={IconTrash}
        onClick={handleManyDelete}
        openModal={openModal}
        setOpenModal={setOpenModal}
        desc="Are you sure you want to delete the selected rows? this action cannot be undone."
        title={deleteTitle ?? "Delete"}
      />
    </>
  );
}