import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch batch details
    const batch = await prisma.voucherBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    // Generate CSV content - simple 1 column format
    const csvRows = ["Kode Voucher"];
    batch.generatedCodes.forEach(code => {
      csvRows.push(code);
    });
    const csvContent = csvRows.join("\n");

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `voucher-batch-${batch.prefix}-${date}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export batch error:", error);
    return NextResponse.json(
      { error: "Failed to export batch" },
      { status: 500 }
    );
  }
}
