import prisma from '@/lib/prisma';

/**
 * Auto activate/deactivate campaigns based on startDate and endDate
 * This function is called by Vercel Cron every 5 minutes
 */
export async function syncCampaignActivation() {
  const now = new Date();

  try {
    // 1. Activate campaigns that should be active now
    // This includes:
    // - Campaigns with endDate that are within the date range
    // - Permanent campaigns (no endDate) that have started
    const activatedCount = await prisma.campaign.updateMany({
      where: {
        startDate: { lte: now },
        OR: [
          { endDate: { gte: now } }, // Temporary campaign still active
          { endDate: null as any }, // Permanent campaign (TypeScript workaround)
        ],
        isActive: false,
      },
      data: { isActive: true },
    });

    // 2. Deactivate campaigns that have ended or haven't started yet
    // Note: Permanent campaigns (endDate: null) are never deactivated by this
    const deactivatedCount = await prisma.campaign.updateMany({
      where: {
        OR: [
          {
            endDate: { lt: now }, // Campaign with endDate that has ended
          },
          { startDate: { gt: now } }, // Campaign not started yet
        ],
        isActive: true,
      },
      data: { isActive: false },
    });

    console.log(`Campaign sync completed:
- Activated: ${activatedCount.count} campaign(s)
- Deactivated: ${deactivatedCount.count} campaign(s)
- Timestamp: ${now.toISOString()}`);

    return {
      success: true,
      activated: activatedCount.count,
      deactivated: deactivatedCount.count,
      timestamp: now,
    };
  } catch (error) {
    console.error('Campaign sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: now,
    };
  }
}
