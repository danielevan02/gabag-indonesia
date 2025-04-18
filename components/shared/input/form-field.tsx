import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { CSSProperties, HTMLInputTypeAttribute, useState } from "react";
import { Control, Controller, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import {PhoneInput} from 'react-international-phone'
import 'react-international-phone/style.css';

interface FormFieldProps<TFieldValues extends FieldValues> {
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  register?: UseFormRegister<TFieldValues>;
  control?: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  isPassword?: boolean;
  isPhone?: boolean;
  name: Path<TFieldValues>
  disable?: boolean
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
  type,
  disable
}:FormFieldProps<TFieldValues>) {
  const [passShown, setPassShown] = useState(false);

  const phoneInputStyle: CSSProperties = {
    width: '100%',
    borderColor: 'black',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    paddingTop: 23,
    paddingBottom: 23,
    fontSize: 16
  }

  const phoneCountrySelectorStyle = {
    buttonStyle: {
      borderColor: 'black',
      borderTopLeftRadius: 7,
      borderBottomLeftRadius: 7,
      paddingTop: 23,
      paddingBottom: 23,
      paddingLeft: 10,
      paddingRight: 10,
    }
  }

  return (
    <div className="flex flex-col gap-2 mb-5 flex-1">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      {isPhone&&control ? (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <PhoneInput
              defaultCountry="id"
              value={field.value}
              onChange={field.onChange}
              inputStyle={phoneInputStyle}
              countrySelectorStyleProps={phoneCountrySelectorStyle}
            />
          )}
        />
      ): isPassword ? (
        <div className="relative flex items-center">
          <Input
            id={name}
            type={passShown ? "text" : "password"}
            placeholder={placeholder}
            className="border-black py-6 text-xs"
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
          className="border-black py-6 text-xs"
          {...(register ? register(name) : {})}
          disabled={disable}
        />
      )}
      {errors?.[name] && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <CircleAlert className="w-3 h-3"/>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};