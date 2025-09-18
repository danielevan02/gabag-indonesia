"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Type data yang bisa digunakan untuk Provinsi, Kota, Kecamatan, dan Kelurahan
type AddressItem = {
  id: string
  name: string
}

// Props untuk combobox address
interface AddressComboboxProps {
  label: string
  items: AddressItem[]
  selectedId?: string
  onSelect: (item: AddressItem) => void
  disabled?: boolean
}

export function AddressDropdown
({ label, items, selectedId, onSelect, disabled=false }: AddressComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedItem = items.find((item) => item.id === selectedId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedItem ? selectedItem.name : `Choose ${label}`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Cari ${label}...`} className="h-9" />
          <CommandList>
            <CommandEmpty className="flex justify-center py-5">
              <Loader className="animate-spin"/>
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  {item.name}
                  <Check className={cn("ml-auto", selectedId === item.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}