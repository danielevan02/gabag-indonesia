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
import { UseFormReturn, FieldValues, FieldPath } from "react-hook-form";
import { MultiSelect, SingleSelect, SelectOption } from "./select-field";
import { Eye, EyeOff } from "lucide-react";
import { PhoneInput } from "./phone-field";

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

type FormInputProps<TFieldValues extends FieldValues = FieldValues> =
  | TextInputProps<TFieldValues>
  | PhoneInputProps<TFieldValues>
  | TextareaInputProps<TFieldValues>
  | SelectInputProps<TFieldValues>
  | PasswordInputProps<TFieldValues>;

export function FormInput<TFieldValues extends FieldValues = FieldValues>(
  props: FormInputProps<TFieldValues>
) {
  const [visible, setVisible] = useState(false);
  const { name, form, fieldType, label, description, placeholder, disabled } = props;

  switch (fieldType) {
    case "password": {
      const { showPass = false } = props as PasswordInputProps<TFieldValues>;

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
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

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <FormControl>
                {isMulti ? (
                  <MultiSelect
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
            <FormItem>
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
            <FormItem>
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
            <FormItem>
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
              <FormControl>
                <Input
                  type={type}
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
  }
}
