"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download, Loader } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { generateOrdersXLSX } from "@/lib/export-orders";

export function ExportOrdersDialog() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>(new Date());

  const getOrdersForExport = trpc.order.getForExport.useQuery(
    {
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
    },
    {
      enabled: false, // Don't run automatically
    }
  );

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error("Silakan pilih rentang tanggal");
      return;
    }

    if (startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    try {
      // Fetch data
      const result = await getOrdersForExport.refetch();

      if (!result.data || result.data.length === 0) {
        toast.error("Tidak ada order dalam rentang tanggal tersebut.");
        return;
      }

      // Generate XLSX
      generateOrdersXLSX(
        result.data as any,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd")
      );

      toast.success(
        `Berhasil export ${result.data.length} order ke file XLSX`
      );
      setOpen(false);

      // Reset dates after successful export
      setStartDate(undefined);
      setEndDate(new Date());
    } catch (error) {
      console.error("Export error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal export orders. Silakan coba lagi.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export XLSX
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Orders ke XLSX</DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal untuk export data order
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Tanggal Mulai
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pilih tanggal mulai</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              Tanggal Akhir
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pilih tanggal akhir</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={getOrdersForExport.isFetching}
            className="gap-2"
          >
            {getOrdersForExport.isFetching ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
