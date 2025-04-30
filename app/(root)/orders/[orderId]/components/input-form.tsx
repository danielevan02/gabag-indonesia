'use client'

import 'react-international-phone/style.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UseFormRegisterReturn,
  Control,
  FieldError,
  UseFormTrigger,
} from "react-hook-form";
import { OrderFormType } from "./order-form";
import { CircleAlert } from "lucide-react";
import { InputPhone } from "@/components/shared/input-phone";

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
        <InputPhone
          id={htmlFor}
          placeholder={placeholder}
          {...register}
          onBlur={()=>trigger(htmlFor)}
          className="min-h-[42px]"
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