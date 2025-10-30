"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RouterOutputs } from "@/trpc/routers/_app";
import VoucherDataTableWrapper from "./voucher-data-table-wrapper";
import BatchDataTableWrapper from "./batch-data-table-wrapper";
import { useState } from "react";
import CreateBatchDialog from "./create-batch-dialog";

type Voucher = RouterOutputs["voucher"]["getAll"][number];
type Batch = RouterOutputs["voucher"]["getAllBatches"][number];

type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; categoryId: string };
type Product = { id: string; name: string; subCategoryId: string };
type Variant = { id: string; name: string; productId: string };

interface VoucherTabsProps {
  vouchers: Voucher[];
  batches: Batch[];
  categories: Category[];
  subCategories: SubCategory[];
  products: Product[];
  variants: Variant[];
}

export default function VoucherTabs({
  vouchers,
  batches,
  categories,
  subCategories,
  products,
  variants,
}: VoucherTabsProps) {
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);

  // Manual vouchers are those not in any batch (we can check by looking at generated codes)
  const batchCodes = new Set(batches.flatMap(b => b.generatedCodes));
  const manualVouchers = vouchers.filter(v => !batchCodes.has(v.code));

  return (
    <>
      <Tabs defaultValue="all" className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Vouchers</TabsTrigger>
            <TabsTrigger value="manual">Manual ({manualVouchers.length})</TabsTrigger>
            <TabsTrigger value="batch">Batch ({batches.length})</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/voucher/add">Create Manual Voucher</Link>
            </Button>
            <Button variant="outline" onClick={() => setIsCreateBatchOpen(true)}>
              Generate Batch
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="flex-1 overflow-hidden flex flex-col mt-0">
          <VoucherDataTableWrapper vouchers={vouchers} />
        </TabsContent>

        <TabsContent value="manual" className="flex-1 overflow-hidden flex flex-col mt-0">
          <VoucherDataTableWrapper vouchers={manualVouchers} />
        </TabsContent>

        <TabsContent value="batch" className="flex-1 overflow-hidden flex flex-col mt-0">
          <BatchDataTableWrapper batches={batches} />
        </TabsContent>
      </Tabs>

      <CreateBatchDialog
        open={isCreateBatchOpen}
        onOpenChange={setIsCreateBatchOpen}
        categories={categories}
        subCategories={subCategories}
        products={products}
        variants={variants}
      />
    </>
  );
}
