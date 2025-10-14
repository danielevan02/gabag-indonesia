"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type SyncResult = {
  success: boolean;
  message: string;
  summary: {
    total: number;
    updated: number;
    errors: number;
    skipped: number;
  } | null;
  updates: Array<{
    sku: string;
    name: string;
    oldStock: number;
    newStock: number;
    type: "product" | "variant";
  }>;
  errors: Array<{
    sku: string;
    stock: number | string;
    reason: string;
  }>;
};

export default function SyncStockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { mutateAsync: syncStock, isPending } = trpc.product.syncStock.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(fileExtension || "")) {
        toast.error("Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.");
        return;
      }
      setFile(selectedFile);
      setResult(null); // Reset previous results
    }
  };

  const handleSync = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setResult(null);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:... prefix

        // Simulate progress (reading file)
        setProgress(10);

        // Start progress simulation
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 5;
          });
        }, 200);

        try {
          const result = await syncStock({
            fileData: base64Data,
            fileName: file.name,
          });

          clearInterval(progressInterval);
          setProgress(100);

          setResult(result);

          if (result.success) {
            toast.success(result.message, {
              description: `Updated: ${result.summary?.updated}, Errors: ${result.summary?.errors}, Skipped: ${result.summary?.skipped}`,
            });
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          clearInterval(progressInterval);
          console.error("Sync error:", error);
          toast.error("Failed to sync stock. Please try again.");
        } finally {
          setIsProcessing(false);
          setTimeout(() => setProgress(0), 1000);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync stock. Please try again.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="form-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-medium text-2xl">Synchronize Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload Excel file to update product stock from warehouse
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/catalog/product">Back to Products</Link>
        </Button>
      </div>

      <div className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Stock File</CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx, .xls) or CSV file with Barcode/SKU and Stock columns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isPending}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </span>
                </label>
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSync}
              disabled={!file || isPending || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? `Synchronizing... ${progress}%` : "Start Synchronization"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <>
            {/* Summary Card */}
            {result.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Rows</p>
                      <p className="text-2xl font-bold">{result.summary.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Updated</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.summary.updated}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">Errors</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {result.summary.errors}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Skipped</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {result.summary.skipped}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Updated Items */}
            {result.updates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Successfully Updated ({result.updates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.updates.map((update, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{update.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {update.sku} • Type: {update.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground line-through">
                            {update.oldStock}
                          </p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {update.newStock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Errors ({result.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">SKU: {error.sku}</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {error.reason}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">Stock: {error.stock}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>Excel file must contain columns named &quot;Barcode&quot; or &quot;SKU&quot; and &quot;Stock&quot;</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>SKU must match the product or variant SKU in the database</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Stock values must be positive numbers</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Rows with missing SKU or Stock will be skipped</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>SKUs not found in database will be reported as errors</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
