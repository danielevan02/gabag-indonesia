import { trpc } from "@/trpc/client";
import { toast } from "sonner";

type DeleteType = "product" | "category" | "subCategory" | "event" | "voucher" | "order" | "carousel";

interface UseDeleteMutationProps {
  type: DeleteType;
  onSuccess?: () => void;
  invalidateQueries?: string[];
}

interface UseDeleteManyMutationProps {
  type: DeleteType;
  onSuccess?: () => void;
}

export const useDeleteMutation = ({ type, onSuccess }: UseDeleteMutationProps) => {
  const utils = trpc.useUtils();

  const mutations = {
    product: trpc.product.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.product.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete product");
      },
    }),

    category: trpc.category.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.category.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete category");
      },
    }),

    subCategory: trpc.subCategory.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.subCategory.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete sub category");
      },
    }),

    event: trpc.event.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.event.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete event");
      },
    }),

    voucher: trpc.voucher.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.voucher.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete voucher");
      },
    }),

    order: trpc.order.delete.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.order.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete order");
      },
    }),

    carousel: trpc.carousel.delete.useMutation({
      onSuccess: (data) => {
        if(data.success) {
          toast.success(data.message)
          utils.carousel.getAll.invalidate()
          onSuccess?.()
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete carousel");
      },
    })
  };

  return mutations[type];
};

export const useDeleteManyMutation = ({ type, onSuccess }: UseDeleteManyMutationProps) => {
  const utils = trpc.useUtils();

  const mutations = {
    product: trpc.product.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.product.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete products");
      },
    }),
    voucher: trpc.voucher.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.voucher.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete vouchers");
      },
    }),
    category: trpc.category.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.category.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete categories");
      },
    }),

    subCategory: trpc.subCategory.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.subCategory.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete sub categories");
      },
    }),

    event: trpc.event.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.event.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete events");
      },
    }),
    order: trpc.order.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.event.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete orders");
      },
    }),
    carousel: trpc.carousel.deleteMany.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          utils.event.getAll.invalidate();
          onSuccess?.();
        } else {
          toast.error(data.message);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to delete carousels");
      },
    })
  };

  return mutations[type];
};
