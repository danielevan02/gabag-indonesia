"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn, FieldValues, FieldPath, get } from "react-hook-form";
import { MultiSelect, SingleSelect, SelectOption } from "./select-field";
import { Eye, EyeOff, CalendarIcon } from "lucide-react";
import { PhoneInput } from "./phone-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BaseFormInputProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface TextInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "text";
  type?: "text" | "email" | "password" | "tel" | "url" | "number";
}

interface PasswordInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "password";
  showPass?: boolean;
}

interface PhoneInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "phone";
  maxLength?: number;
  onValueChange?: (value: string) => void;
}

interface TextareaInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "textarea";
  rows?: number;
  maxLength?: number;
}

interface SelectInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "select";
  options: SelectOption[];
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  maxItems?: number;
  noOptionsMessage?: string;
  searchPlaceholder?: string;
  onValueChange?: (value: string | string[]) => void;
}

interface DateInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "date";
}

interface DateTimeInputProps<TFieldValues extends FieldValues = FieldValues>
  extends BaseFormInputProps<TFieldValues> {
  fieldType: "datetime";
}

type FormInputProps<TFieldValues extends FieldValues = FieldValues> =
  | TextInputProps<TFieldValues>
  | PhoneInputProps<TFieldValues>
  | TextareaInputProps<TFieldValues>
  | SelectInputProps<TFieldValues>
  | PasswordInputProps<TFieldValues>
  | DateInputProps<TFieldValues>
  | DateTimeInputProps<TFieldValues>;

export function FormInput<TFieldValues extends FieldValues = FieldValues>(
  props: FormInputProps<TFieldValues>
) {
  const [visible, setVisible] = useState(false);
  const { name, form, fieldType, label, description, placeholder, disabled, className } = props;

  switch (fieldType) {
    case "password": {
      const { showPass = false } = props as PasswordInputProps<TFieldValues>;

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <div className="relative flex items-center">
                <FormControl>
                  <Input
                    type={visible ? "text" : "password"}
                    className="border border-black py-5"
                    placeholder={placeholder}
                    disabled={disabled}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <div
                  className="absolute right-2 cursor-pointer"
                  onClick={() => setVisible((prev) => !prev)}
                >
                  {showPass ? (
                    visible ? (
                      <EyeOff strokeWidth={1} />
                    ) : (
                      <Eye strokeWidth={1} />
                    )
                  ) : undefined}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    case "select": {
      const selectProps = props as SelectInputProps<TFieldValues>;
      const {
        options,
        isMulti = false,
        isSearchable = true,
        isClearable = true,
        maxItems,
        noOptionsMessage = "No options found.",
        searchPlaceholder = "Search...",
        onValueChange,
      } = selectProps;

      const isError = !!get(form.formState.errors, name)
      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <FormControl>
                {isMulti ? (
                  <MultiSelect
                    isError={isError}
                    options={options}
                    value={field.value || []}
                    onChange={(value) => {
                      field.onChange(value);
                      onValueChange?.(value);
                    }}
                    placeholder={placeholder}
                    isSearchable={isSearchable}
                    isClearable={isClearable}
                    maxItems={maxItems}
                    noOptionsMessage={noOptionsMessage}
                    searchPlaceholder={searchPlaceholder}
                    disabled={disabled}
                  />
                ) : (
                  <SingleSelect
                    isError={isError}
                    options={options}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      onValueChange?.(value);
                    }}
                    placeholder={placeholder}
                    isSearchable={isSearchable}
                    isClearable={isClearable}
                    noOptionsMessage={noOptionsMessage}
                    searchPlaceholder={searchPlaceholder}
                    disabled={disabled}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    case "textarea": {
      const textareaProps = props as TextareaInputProps<TFieldValues>;
      const { rows, maxLength } = textareaProps;

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <FormControl>
                <Textarea
                  className="border border-black py-5"
                  placeholder={placeholder}
                  rows={rows}
                  maxLength={maxLength}
                  disabled={disabled}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    case "phone": {
      const phoneProps = props as PhoneInputProps<TFieldValues>;
      const { maxLength, onValueChange } = phoneProps;

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
                <PhoneInput
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value);
                    onValueChange?.(value);
                  }}
                  placeholder={placeholder}
                  disabled={disabled}
                  maxLength={maxLength}
                />
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    default: {
      const textProps = props as TextInputProps<TFieldValues>;
      const { type = "text" } = textProps;

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <FormControl>
                <Input
                  type={type}
                  min={0}
                  className="border border-black py-5"
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    case "date": {
      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={cn("flex flex-col", className)}>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "border border-black py-5 pl-3 text-left font-normal w-full",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{placeholder || "Pick a date"}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                    disabled={disabled}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    case "datetime": {
      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => {
            const handleDateSelect = (date: Date | undefined) => {
              if (!date) {
                field.onChange(undefined);
                return;
              }

              // Preserve existing time if there's already a value
              if (field.value) {
                const existingDate = new Date(field.value);
                date.setHours(existingDate.getHours());
                date.setMinutes(existingDate.getMinutes());
              }
              field.onChange(date);
            };

            const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
              const currentDate = field.value ? new Date(field.value) : new Date();

              if (type === 'hours') {
                currentDate.setHours(parseInt(value) || 0);
              } else {
                currentDate.setMinutes(parseInt(value) || 0);
              }

              field.onChange(currentDate);
            };

            return (
              <FormItem className={cn("flex flex-col", className)}>
                <FormLabel>{label}</FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "border border-black py-5 pl-3 text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                      >
                        {field.value ? (
                          format(field.value, "PPP 'at' HH:mm")
                        ) : (
                          <span>{placeholder || "Pick a date and time"}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                      captionLayout="dropdown"
                      disabled={disabled}
                    />
                    <div className="border-t p-3 space-y-2">
                      <div className="text-sm font-medium">Time</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          placeholder="HH"
                          value={field.value ? format(field.value, "HH") : "00"}
                          onChange={(e) => handleTimeChange('hours', e.target.value)}
                          className="w-16 text-center"
                          disabled={disabled}
                        />
                        <span>:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="MM"
                          value={field.value ? format(field.value, "mm") : "00"}
                          onChange={(e) => handleTimeChange('minutes', e.target.value)}
                          className="w-16 text-center"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    }
  }
}
