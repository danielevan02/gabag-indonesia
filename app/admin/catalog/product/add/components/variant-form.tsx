// "use client";

// import { Button } from "@/components/ui/button";
// import { FormField } from "@/components/shared/input/form-field";
// import { variantSchema } from "@/lib/schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { X } from "lucide-react";
// import { useEdgeStore } from "@/lib/edge-store";
// import { UploadFn } from "@/components/upload/uploader-provider";
// import { generateFileName } from "@/lib/utils";
// import { useState } from "react";

// type VariantFormType = z.infer<typeof variantSchema>;

// interface VariantFormProps {
//   index: number;
//   onRemove: (index: number) => void;
//   register: any;
//   errors: any;
//   control: any;
//   setValue: any;
// }

// const VariantForm = ({ index, onRemove, register, errors, control, setValue }: VariantFormProps) => {
//   const { edgestore } = useEdgeStore();
//   const [triggerUpload, setTriggerUpload] = useState(false);

//   const handleUpload: UploadFn = async ({ file, signal, onProgressChange }) => {
//     const res = await edgestore.publicImages.upload({
//       file,
//       signal,
//       onProgressChange,
//       options: {
//         manualFileName: generateFileName("variant", `${index}`, ".png"),
//       },
//     });

//     setValue(`variants.${index}.image`, res.url);
//     return { url: res.url };
//   };

//   return (
//     <div className="relative p-4 border rounded-lg space-y-4">
//       <Button
//         type="button"
//         variant="ghost"
//         size="icon"
//         className="absolute right-2 top-2"
//         onClick={() => onRemove(index)}
//       >
//         <X className="h-4 w-4" />
//       </Button>

//       <FormField
//         label="Variant Name"
//         name={`variants.${index}.name`}
//         type="text"
//         register={register}
//         errors={errors}
//         required
//         placeholder="Enter variant name"
//       />

//       <FormField
//         label="SKU"
//         name={`variants.${index}.sku`}
//         type="text"
//         register={register}
//         errors={errors}
//         placeholder="Enter SKU (optional)"
//       />

//       <FormField
//         label="Price"
//         name={`variants.${index}.price`}
//         type="number"
//         register={register}
//         errors={errors}
//         required
//         placeholder="Enter variant price"
//       />

//       <FormField
//         label="Stock"
//         name={`variants.${index}.stock`}
//         type="number"
//         register={register}
//         errors={errors}
//         required
//         placeholder="Enter stock quantity"
//       />

//       <FormField
//         label="Discount"
//         name={`variants.${index}.discount`}
//         type="number"
//         register={register}
//         errors={errors}
//         placeholder="Enter discount percentage"
//       />

//       <div className="w-fit">
//         <FormField
//           label="Variant Image"
//           name={`variants.${index}.image`}
//           type="image"
//           uploadFn={handleUpload}
//           triggerUpload={triggerUpload}
//           errors={errors}
//           required
//           register={register}
//         />
//       </div>

//       <Button type="button" onClick={() => setTriggerUpload(true)}>
//         Upload Variant Image
//       </Button>
//     </div>
//   );
// };

// export default VariantForm; 