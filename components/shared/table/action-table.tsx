import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ModalContent from "./modal-content";
import { toast } from "sonner";


interface ActionTableProps {
  id: string;
  desc: string;
  title: string;
  deleteFunction: (id: string) => Promise<unknown>
  type: string;
  catalog?: boolean
}

const ActionTable: React.FC<ActionTableProps> = ({ id, desc, title, deleteFunction, type, catalog }) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const href = catalog || catalog == null ? `/admin/catalog/${type}/${id}` : `/admin/${type}/${id}`

  const menus = [
    {label: 'Edit', icon:<IconPencil/>, href: href},
    {label: 'Delete', icon:<IconTrash/>, onClick: () => setDeleteModal(true)},
  ]

  const mutation = useMutation({
    mutationFn: (id: string) => deleteFunction(id),
  });

  const handleDelete = useCallback(() => {
    mutation.mutate(id, {
      onSuccess: () => {
        setDeleteModal(false);
        toast.success("Delete successfully!");
      },
      onError: (error) => console.log(error),
    });
  }, [id, mutation])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {menus.map((menu, idx) => {
            if(menu.href){
              return(
                <a href={menu.href} key={idx}>
                  <DropdownMenuItem>
                    {menu.icon}
                    {menu.label}
                  </DropdownMenuItem>
                </a>
              )
            } else {
              return(
                <DropdownMenuItem onClick={menu.onClick} key={idx}>
                  {menu.icon}
                  {menu.label}
                </DropdownMenuItem>
              )
            }
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ModalContent
        openModal={deleteModal}
        setOpenModal={setDeleteModal}
        icon={IconTrash}
        button="Delete"
        desc={desc}
        title={title}
        onClick={handleDelete}
      />
    </>
  );
};

export default ActionTable;