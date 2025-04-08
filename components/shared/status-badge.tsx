import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const StatusBadge = ({status, className}:{status: string; className?: string;}) => {
  return (
    <Badge 
      className={cn('flex capitalize',
        status === "settlement" && "bg-green-200 text-green-700",
        status === "pending" && "bg-blue-200 text-blue-700",
        ['expire', 'deny', 'cancel'].includes(status) && "bg-red-200 text-red-700",
        className
      )}
    >
      <div 
        className={cn("h-2 w-2 rounded-full ",
          status === "settlement" && "bg-green-400",
          status === "pending" && "bg-blue-400",
          ['expire', 'deny', 'cancel'].includes(status) && "bg-red-400",
        )}
      />
      {status}
    </Badge>
  );
};

export default StatusBadge;
