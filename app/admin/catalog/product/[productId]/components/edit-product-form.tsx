"use client";

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { updateProduct } from "@/lib/actions/product.action";
import { productSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductFormType } from "../../add/components/product-form";
import { Label } from "@/components/ui/label";
import GalleryModal from "@/components/gallery/gallery-modal-my";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableImage from "@/components/gallery/sortable-image";
import { closestCorners, DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    subCategory: {
      value: string;
      label: string;
    } | null;
    image: string[];
    price: number;
    discount: number;
    description: string;
    stock: number;
  };
  subCategoryList: {
    value: string;
    label: string;
  }[];
}

const EditProductForm = ({ product, subCategoryList }: EditProductFormProps) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product.image);

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      subCategory: product.subCategory,
      price: product.price,
      discount: product.discount,
      description: product.description,
      stock: product.stock,
      image: images,
    },
  });

  const onSubmit = async (data: ProductFormType) => {
    startTransition(async () => {
      try {
        const response = await updateProduct({
          ...data,
          image: images,
          id: product.id,
        });

        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/product");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product");
      }
    });
  };

  // const handleImageSelect = (imageUrls: string[]) => {
  //   setImages(imageUrls);
  //   setValue('image', imageUrls);
  // };

  const getImageIndex = (id: UniqueIdentifier) => {
    return images?.findIndex((img) => img === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id === over?.id) return;

    setImages((prev) => {
      const currentPosition = getImageIndex(active.id);
      const newPosition = getImageIndex(over!.id);

      return arrayMove(prev, currentPosition || 0, newPosition || 0);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
    >
      <FormField
        label="Name"
        name="name"
        placeholder="Please enter product name"
        register={register}
        errors={errors}
        required
      />
      <FormField
        label="Select Sub Category"
        name="subCategory"
        placeholder="Please choose the sub category"
        type="select"
        errors={errors}
        options={subCategoryList}
        control={control}
        required
      />
      <FormField
        label="Price"
        name="price"
        type="number"
        placeholder="Please enter product price"
        register={register}
        errors={errors}
        required
      />

      <div className="flex gap-2 flex-col mb-5">
        <Label>Product Photo(s)</Label>
        <p className="text-xs text-neutral-600">NOTE: You can add more than 1 image</p>
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <div className="flex flex-col gap-2">
            <SortableContext items={images || []} strategy={rectSortingStrategy}>
              {images ? (
                // SHOW THIS IF THERE IS IMAGES
                <div className="w-full flex gap-2 justify-start flex-wrap">
                  {images.map((image) => (
                    <SortableImage key={image} url={image} />
                  ))}
                </div>
              ) : (
                // SHOW THIS IF THERE IS NO IMAGES
                <div className="flex flex-col items-center justify-center size-44 rounded-md border bg-accent gap-4">
                  <ImagePlus />
                  <span className="text-sm text-neutral-700">Add product images</span>
                </div>
              )}
            </SortableContext>

            <GalleryModal initialSelectedImages={images} />
          </div>
        </DndContext>
      </div>

      {/* <div className="space-y-4">
        <div className="flex items-center gap-4">
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative h-32 w-32 flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
          >
            {images.length > 0 ? 'Change Photos' : 'Add Photos'}
          </Button>
        </div>

        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleImageSelect}
          initialSelectedImages={images}
        />
      </div> */}

      <FormField
        label="Discount (optional)"
        name="discount"
        type="number"
        placeholder="Please input the discount"
        errors={errors}
        register={register}
      />
      <FormField
        label="Stock"
        name="stock"
        type="number"
        placeholder="Please input the stock"
        errors={errors}
        register={register}
      />
      <FormField
        label="Description"
        name="description"
        type="textarea"
        placeholder="Please enter product description"
        register={register}
        errors={errors}
        required
      />

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
