import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "../ui/tooltip";

export const TooltipWrapper = ({ children, text }: { children: React.ReactNode; text: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};