"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface FormCheckboxProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  form,
  name,
  label,
  description,
  disabled = false,
  className = "",
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex flex-row items-center space-x-3 space-y-0 ${className}`}>
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={disabled}
              className="peer h-4 w-4 shrink-0 rounded-[4px] border border-input bg-background shadow-xs ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary accent-primary cursor-pointer"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="cursor-pointer font-normal">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
};