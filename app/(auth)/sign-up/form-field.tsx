import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { HTMLInputTypeAttribute, useState } from "react";
import { Control, Controller, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import PhoneInput from 'react-phone-number-input'

type FormFieldProps<TFieldValues extends FieldValues> = {
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  register?: UseFormRegister<TFieldValues>;
  control?: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  isPassword?: boolean;
  isPhone?: boolean;
  name: Path<TFieldValues>
}

export function FormField<TFieldValues extends FieldValues>({
  label,
  name,
  control, 
  errors,
  isPassword,
  isPhone,
  placeholder,
  register,
  type
}:FormFieldProps<TFieldValues>) {
  const [passShown, setPassShown] = useState(false);
  return (
    <div className="flex flex-col gap-2 mb-5">
      <Label htmlFor={name} className="text-lg">
        {label}
      </Label>
      {isPhone&&control ? (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <PhoneInput
              international
              className="border rounded-md py-3 pl-3 border-black dark:bg-neutral-900"
              defaultCountry="ID"
              autoComplete="phone"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ): isPassword ? (
        <div className="relative flex items-center">
          <Input
            id={name}
            type={passShown ? "text" : "password"}
            placeholder={placeholder}
            className="border-black peer py-6"
            {...(register ? register(name) : {})}
          />
          {passShown ? (
            <EyeOff className="w-5 h-5 absolute right-3 cursor-pointer" onClick={() => setPassShown(false)} />
          ) : (
            <Eye className="w-5 h-5 absolute right-3 cursor-pointer" onClick={() => setPassShown(true)} />
          )}
        </div>
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          className="border-black peer py-6"
          {...(register ? register(name) : {})}
        />
      )}
      {errors?.[name] && (
        <p className="text-xs text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};