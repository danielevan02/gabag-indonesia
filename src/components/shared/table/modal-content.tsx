import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button"; 

interface ModalContentProps {
  openModal: boolean
  setOpenModal: (open: boolean) => void
  desc?: string
  title?: string
  icon: Icon
  button: string
  onClick: () => void
}

const ModalContent: React.FC<ModalContentProps> = ({openModal, setOpenModal, desc, title, icon: Icon, button, onClick}) => {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex gap-3 items-center">
            {title}
            <Icon className="rounded-full bg-red-200 text-red-500 p-1" />
          </DialogTitle>
        </DialogHeader>
        <span className="text-neutral-500 text-sm leading-6">{desc}</span>
        <DialogFooter>
          <Button onClick={() => setOpenModal(false)} className="focus:outline-none" variant="secondary">
            Cancel
          </Button>
          <Button className="bg-red-200 text-red-600 hover:bg-red-100" onClick={onClick}>{button}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalContent;