import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isMinusDisabled: boolean;
  isPlusDisabled: boolean;
}

export const QuantityControl = ({ 
  quantity, 
  onDecrease, 
  onIncrease, 
  isMinusDisabled, 
  isPlusDisabled 
}: QuantityControlProps) => (
  <div className="flex items-center justify-between rounded-full border border-black flex-1 md:flex-none">
    <Button variant="ghost" className="rounded-full" disabled={isMinusDisabled} onClick={onDecrease}>
      <Minus />
    </Button>
    <div className="py-1 w-16 text-center">{quantity}</div>
    <Button variant="ghost" className="rounded-full" disabled={isPlusDisabled} onClick={onIncrease}>
      <Plus />
    </Button>
  </div>
);
