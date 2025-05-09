"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { Dispatch, HTMLInputTypeAttribute, SetStateAction, useState } from "react";
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
import Select from "react-select";
import makeAnimated from "react-select/animated";
import UploadImage from "@/app/admin/catalog/sub-category/add/components/upload-image";
import { Button } from "@/components/ui/button";

interface FormFieldProps<TFieldValues extends FieldValues> {
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  register?: UseFormRegister<TFieldValues>;
  control?: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  uploadFn?: UploadFn;
  setIsImageUploaded?: Dispatch<SetStateAction<boolean>>;
  isPassword?: boolean;
  isPhone?: boolean;
  name: Path<TFieldValues>;
  disable?: boolean;
  isMulti?: boolean;
  required?: boolean;
  options?: {
    value: string;
    label: string;
  }[];
}

type SelectOption = { value: string; label: string };

export function FormField<TFieldValues extends FieldValues>({
  control,
  label,
  name,
  errors,
  isPassword,
  isPhone,
  placeholder,
  register,
  uploadFn,
  options,
  setIsImageUploaded,
  isMulti,
  required,
  type,
  disable,
}: FormFieldProps<TFieldValues>) {
  const [passShown, setPassShown] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [isFileAdded, setIsFileAdded] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const animatedComponent = makeAnimated();
  return (
    <div className="flex flex-col gap-2 mb-5">
      <Label htmlFor={name} className="text-sm flex gap-1">
        {label}
        {required && <p className="text-red-500">*</p>}
      </Label>
      {isPhone ? (
        <InputPhone
          id={name}
          className="border-black min-h-12"
          {...(register ? register(name) : {})}
        />
      ) : isPassword ? (
        <div className="relative flex items-center">
          <Input
            id={name}
            type={passShown ? "text" : "password"}
            placeholder={placeholder}
            className="border-black py-6 text-xs"
            {...(register ? register(name) : {})}
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
      ) : type === "image" ? (
        <div className="flex items-center gap-5">
          <UploaderProvider
            uploadFn={uploadFn!}
            onFileAdded={() => {
              setIsFileAdded(true);
              setIsImageUploaded!(true);
            }}
          >
            <UploadImage triggerUpload={trigger} />
          </UploaderProvider>

          {isFileAdded && showUpload && (
            <Button
              onClick={() => {
                setTrigger(true);
                setShowUpload(false);
              }}
            >
              Upload Image
            </Button>
          )}
        </div>
      ) : type === "select" ? (
        <Controller
          control={control}
          name={name}
          render={({ field: { onBlur, onChange, value } }) => (
            <Select<SelectOption, boolean>
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
              isMulti={isMulti}
              placeholder={placeholder}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              options={options}
            />
          )}
        />
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          className="border-black py-6 text-xs"
          {...(register ? register(name) : {})}
          disabled={disable}
        />
      )}
      {errors?.[name] && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <CircleAlert className="w-3 h-3" />
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
