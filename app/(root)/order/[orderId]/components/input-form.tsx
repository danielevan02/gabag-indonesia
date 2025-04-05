'use client'

import PhoneInput from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UseFormRegisterReturn,
  Controller,
  Control,
  FieldError,
  UseFormTrigger,
} from "react-hook-form";
import { OrderFormType } from "./order-form";
import { CircleAlert } from "lucide-react";

interface InputFormProps {
  label: string;
  placeholder: string;
  htmlFor: keyof OrderFormType;
  type?: React.HTMLInputTypeAttribute;
  register: UseFormRegisterReturn;
  control?: Control<OrderFormType>;
  errors?: FieldError;
  trigger: UseFormTrigger<OrderFormType>;
}

const InputForm = ({
  label,
  placeholder,
  type,
  htmlFor,
  register,
  control,
  errors,
  trigger,
}: InputFormProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs uppercase" htmlFor={htmlFor}>
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={htmlFor}
          placeholder={placeholder}
          className="shadow-none"
          {...register}
          onBlur={() => trigger(htmlFor)}
        />
      ) : type === "phone" ? (
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              international
              className="border rounded-md p-2 dark:bg-neutral-900"
              defaultCountry="ID"
              autoComplete="phone"
              value={field.value}
              onChange={field.onChange}
              onBlur={() => trigger(htmlFor)}
            />
          )}
        />
      ) : (
        <Input
          id={htmlFor}
          placeholder={placeholder}
          className="shadow-none p-5"
          type={type}
          {...register}
          onBlur={() => trigger(htmlFor)}
        />
      )}
      {errors?.message && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <CircleAlert className="w-4 h-4" />
          {errors.message}
        </p>
      )}
    </div>
  );
};

export default InputForm