import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  PackageCheck,
  Truck,
  CircleCheck,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  PackageX,
  Ban,
  Trash2,
} from "lucide-react";

type ShippingStatus =
  | "confirmed"
  | "allocated"
  | "picking_up"
  | "picked"
  | "dropping_off"
  | "delivered"
  | "return_in_transit"
  | "returned"
  | "on_hold"
  | "rejected"
  | "courier_not_found"
  | "cancelled"
  | "disposed"
  | null
  | undefined;

interface ShippingStatusBadgeProps {
  status: ShippingStatus;
  shippingInfo?: any;
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  confirmed: {
    label: "Confirmed",
    variant: "secondary",
    className: "bg-blue-100 text-blue-700 border-blue-300",
    icon: PackageCheck,
  },
  allocated: {
    label: "Allocated",
    variant: "secondary",
    className: "bg-cyan-100 text-cyan-700 border-cyan-300",
    icon: Package,
  },
  picking_up: {
    label: "Picking Up",
    variant: "default",
    className: "bg-indigo-100 text-indigo-700 border-indigo-300",
    icon: Truck,
  },
  picked: {
    label: "Picked",
    variant: "default",
    className: "bg-purple-100 text-purple-700 border-purple-300",
    icon: PackageCheck,
  },
  dropping_off: {
    label: "In Transit",
    variant: "default",
    className: "bg-amber-100 text-amber-700 border-amber-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-300",
    icon: CircleCheck,
  },
  return_in_transit: {
    label: "Returning",
    variant: "secondary",
    className: "bg-orange-100 text-orange-700 border-orange-300",
    icon: RotateCcw,
  },
  returned: {
    label: "Returned",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-300",
    icon: RotateCcw,
  },
  on_hold: {
    label: "On Hold",
    variant: "outline",
    className: "bg-yellow-100 text-yellow-700 border-yellow-400",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
  },
  courier_not_found: {
    label: "No Courier",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-gray-100 text-gray-700 border-gray-300",
    icon: Ban,
  },
  disposed: {
    label: "Disposed",
    variant: "destructive",
    className: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Trash2,
  },
  not_shipped: {
    label: "Not Shipped",
    variant: "outline",
    className: "bg-gray-50 text-gray-500 border-gray-300",
    icon: PackageX,
  },
};

export function ShippingStatusBadge({
  status,
  shippingInfo,
  showIcon = true,
  className,
}: ShippingStatusBadgeProps) {
  // Get current status from shippingInfo if available
  const currentStatus =
    shippingInfo?.currentStatus || status || "not_shipped";

  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.not_shipped;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("font-medium gap-1.5", config.className, className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}

// Helper function to get status text without badge
export function getShippingStatusText(
  status: ShippingStatus,
  shippingInfo?: any
): string {
  const currentStatus =
    shippingInfo?.currentStatus || status || "not_shipped";
  return STATUS_CONFIG[currentStatus]?.label || "Unknown";
}

// Helper function to check if order is in transit
export function isInTransit(status: ShippingStatus, shippingInfo?: any): boolean {
  const currentStatus = shippingInfo?.currentStatus || status;
  return ["picking_up", "picked", "dropping_off"].includes(currentStatus || "");
}

// Helper function to check if order is completed (delivered or returned)
export function isCompleted(status: ShippingStatus, shippingInfo?: any): boolean {
  const currentStatus = shippingInfo?.currentStatus || status;
  return ["delivered", "returned", "disposed"].includes(currentStatus || "");
}

// Helper function to check if order has issues
export function hasIssues(status: ShippingStatus, shippingInfo?: any): boolean {
  const currentStatus = shippingInfo?.currentStatus || status;
  return ["on_hold", "rejected", "courier_not_found", "cancelled"].includes(
    currentStatus || ""
  );
}
