import { format } from "date-fns";
import { Check, Circle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusHistoryItem {
  status: string;
  rawStatus: string;
  timestamp: string;
  note: string;
  updated_by?: string;
  event?: string;
}

interface ShippingTimelineProps {
  shippingInfo: any;
  className?: string;
}

export function ShippingTimeline({ shippingInfo, className }: ShippingTimelineProps) {
  const statusHistory: StatusHistoryItem[] = shippingInfo?.statusHistory || [];
  const courierLink = shippingInfo?.courierLink;
  const trackingId = shippingInfo?.trackingId;
  const courierWaybillId = shippingInfo?.courierWaybillId;

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className={cn("rounded-lg border p-6", className)}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Tracking Information
        </h3>
        <p className="text-sm text-muted-foreground italic">
          No tracking information available yet.
        </p>
      </div>
    );
  }

  // Reverse to show latest first
  const reversedHistory = [...statusHistory].reverse();

  return (
    <div className={cn("rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Tracking Information
        </h3>
        {courierLink && (
          <a
            href={courierLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Track Package →
          </a>
        )}
      </div>

      {/* Tracking Details */}
      {(trackingId || courierWaybillId) && (
        <div className="mb-6 p-3 bg-muted/50 rounded-md space-y-1">
          {courierWaybillId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Waybill Number:</span>
              <span className="font-medium">{courierWaybillId}</span>
            </div>
          )}
          {trackingId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tracking ID:</span>
              <span className="font-mono text-xs">{trackingId}</span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {reversedHistory.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === reversedHistory.length - 1;
          const isDelivered = item.status === "delivered";

          return (
            <div key={index} className="relative flex gap-4">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-full bg-border" />
              )}

              {/* Status Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  isDelivered
                    ? "bg-green-500 border-green-500"
                    : isFirst
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                )}
              >
                {isDelivered ? (
                  <Check className="h-3 w-3 text-white" />
                ) : isFirst ? (
                  <Circle className="h-2 w-2 fill-white text-white" />
                ) : (
                  <Circle className="h-2 w-2 fill-muted text-muted" />
                )}
              </div>

              {/* Status Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isFirst ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {getStatusLabel(item.status)}
                    </p>
                    {item.note && item.note !== `Status updated to ${item.rawStatus}` && (
                      <p className="text-sm text-muted-foreground">{item.note}</p>
                    )}
                    {item.updated_by && item.updated_by !== "biteship" && (
                      <p className="text-xs text-muted-foreground">
                        Updated by: {item.updated_by}
                      </p>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(item.timestamp), "dd MMM yyyy, HH:mm")}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Info if available */}
      {shippingInfo?.driverName && (
        <div className="mt-6 p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium text-sm mb-3">Driver Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{shippingInfo.driverName}</span>
            </div>
            {shippingInfo.driverPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{shippingInfo.driverPhone}</span>
              </div>
            )}
            {shippingInfo.driverPlateNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">{shippingInfo.driverPlateNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get readable status labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: "Order Confirmed",
    allocated: "Courier Allocated",
    picking_up: "Courier Picking Up",
    picked: "Package Picked Up",
    dropping_off: "On the Way to You",
    delivered: "Package Delivered",
    return_in_transit: "Returning to Sender",
    returned: "Package Returned",
    on_hold: "Shipment On Hold",
    rejected: "Shipment Rejected",
    courier_not_found: "No Courier Available",
    cancelled: "Order Cancelled",
    disposed: "Package Disposed",
  };

  return labels[status] || status;
}
