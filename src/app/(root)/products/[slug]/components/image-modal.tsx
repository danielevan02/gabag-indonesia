import { X } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface ImageModalProps {
  imageModal: string;
  onClose: () => void;
}

export const ImageModal = ({ imageModal, onClose }: ImageModalProps) => {
  if (!imageModal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="relative w-[90vw] lg:w-[30vw]">
        <Image
          src={imageModal}
          alt="Image Modal"
          width={700}
          height={700}
          className="w-full"
        />
        <X
          className="hover:scale-125 transition-all absolute top-3 right-3 cursor-pointer"
          onClick={onClose}
        />
      </div>
    </div>,
    document.body
  );
};