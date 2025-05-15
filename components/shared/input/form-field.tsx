"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { HTMLInputTypeAttribute, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import "react-international-phone/style.css";
import { InputPhone } from "../input-phone";
import { UploaderProvider, UploadFn } from "@/components/upload/uploader-provider";
import makeAnimated from "react-select/animated";
import UploadImage from "@/app/admin/catalog/sub-category/add/components/upload-image";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });
// Types
type SelectOption = { value: string; label: string };

interface BaseFormFieldProps<TFieldValues extends FieldValues> {
  label: string;
  name: Path<TFieldValues>;
  required?: boolean;
  errors?: FieldErrors<TFieldValues>;
}

interface InputFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  register?: UseFormRegister<TFieldValues>;
  disabled?: boolean;
}

interface SelectFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'select';
  control: Control<TFieldValues>;
  placeholder?: string;
  options: SelectOption[];
  isMulti?: boolean;
  disabled?: boolean;
}

interface PasswordFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'password';
  placeholder?: string;
  register?: UseFormRegister<TFieldValues>;
  disabled?: boolean;
}

interface PhoneFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'phone';
  register?: UseFormRegister<TFieldValues>;
  disabled?: boolean;
}

interface ImageFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'image';
  uploadFn: UploadFn;
  triggerUpload?: boolean;
  initialPhoto?: string;
}

type FormFieldProps<TFieldValues extends FieldValues> =
  | InputFormFieldProps<TFieldValues>
  | SelectFormFieldProps<TFieldValues>
  | PasswordFormFieldProps<TFieldValues>
  | PhoneFormFieldProps<TFieldValues>
  | ImageFormFieldProps<TFieldValues>;

// Sub-components
const ErrorMessage = ({ message }: { message: string }) => (
  <p className="text-xs text-red-600 flex items-center gap-1">
    <CircleAlert className="w-3 h-3" />
    {message}
  </p>
);

const FormLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <Label className="text-sm flex gap-1">
    {label}
    {required && <p className="text-red-500">*</p>}
  </Label>
);

// Main component
export function FormField<TFieldValues extends FieldValues>({
  label,
  name,
  errors,
  required,
  type,
  ...props
}: FormFieldProps<TFieldValues>) {
  const [passShown, setPassShown] = useState(false);
  const renderField = () => {
    switch (type) {
      case 'phone': {
        const phoneProps = props as PhoneFormFieldProps<TFieldValues>;
        return (
          <InputPhone
            id={name}
            className="border-black min-h-12"
            {...(phoneProps.register ? phoneProps.register(name) : {})}
            disabled={phoneProps.disabled}
          />
        );
      }

      case 'password': {
        const passwordProps = props as PasswordFormFieldProps<TFieldValues>;
        return (
          <div className="relative flex items-center">
            <Input
              id={name}
              type={passShown ? "text" : "password"}
              placeholder={passwordProps.placeholder}
              className="border-black py-6 text-xs"
              {...(passwordProps.register ? passwordProps.register(name) : {})}
              disabled={passwordProps.disabled}
            />
            {passShown ? (
              <EyeOff
                className="w-5 h-5 absolute right-3 cursor-pointer"
                onClick={() => setPassShown(false)}
              />
            ) : (
              <Eye
                className="w-5 h-5 absolute right-3 cursor-pointer"
                onClick={() => setPassShown(true)}
              />
            )}
          </div>
        );
      }

      case 'image': {
        const imageProps = props as ImageFormFieldProps<TFieldValues>;
        return (
          <div className="w-fit">
            <UploaderProvider 
              uploadFn={imageProps.uploadFn}
              
            >
              <UploadImage 
                triggerUpload={imageProps.triggerUpload}
                initialPhoto={imageProps.initialPhoto}
              />
            </UploaderProvider>
          </div>
        );
      }

      case 'select': {
        const selectProps = props as SelectFormFieldProps<TFieldValues>;
        const animatedComponent = makeAnimated();
        return (
          <Controller
            control={selectProps.control}
            name={name}
            render={({ field: { onBlur, onChange, value } }) => (
              <Select
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "black",
                    borderRadius: 7,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }),
                }}
                components={animatedComponent}
                isMulti={selectProps.isMulti}
                placeholder={selectProps.placeholder}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                options={selectProps.options}
                isDisabled={selectProps.disabled}
              />
            )}
          />
        );
      }

      default: {
        const inputProps = props as InputFormFieldProps<TFieldValues>;
        return (
          <Input
            id={name}
            type={type}
            placeholder={inputProps.placeholder}
            className="border-black py-6 text-xs"
            {...(inputProps.register ? inputProps.register(name) : {})}
            disabled={inputProps.disabled}
          />
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-5">
      <FormLabel label={label} required={required} />
      {renderField()}
      {errors?.[name] && <ErrorMessage message={errors[name]?.message as string} />}
    </div>
  );
}
