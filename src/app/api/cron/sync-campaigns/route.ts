import { syncCampaignActivation } from '@/lib/cron/sync-campaigns';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route untuk Vercel Cron Job
 * Akan dipanggil otomatis setiap 5 menit untuk sync campaign activation
 *
 * Security: Verify cron secret dari Vercel
 */
export async function GET(request: NextRequest) {
  // Verify authorization dari Vercel Cron
  const authHeader = request.headers.get('authorization');

  // Di production, Vercel akan kirim "Bearer <CRON_SECRET>"
  // Di development, bisa skip verification
  if (process.env.NODE_ENV === 'production') {
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // Run campaign sync
  const result = await syncCampaignActivation();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Campaign sync completed successfully',
      data: result,
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        message: 'Campaign sync failed',
        error: result.error,
      },
      { status: 500 }
    );
  }
}

// Optional: Support POST method juga untuk manual trigger via Postman/curl
export async function POST(request: NextRequest) {
  return GET(request);
}
