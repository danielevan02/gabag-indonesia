'use client'

import { User } from "@prisma/client";
import { Label } from "./ui/label";
import { AddressDropdown } from "./shared/address-dropdown";
import { useEffect, useState } from "react";

interface AddressFormProps {
  user?: User
}

type AddressItem = { id: string; name: string }

async function fetchData(url: string): Promise<AddressItem[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Gagal memuat data")
  return res.json()
}

const AddressForm: React.FC<AddressFormProps> = ({user}) => {
  const [provinces, setProvinces] = useState<AddressItem[]>([])
  const [cities, setCities] = useState<AddressItem[]>([])
  const [districts, setDistricts] = useState<AddressItem[]>([])
  const [villages, setVillages] = useState<AddressItem[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>()
  const [selectedCity, setSelectedCity] = useState<string | undefined>()
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>()
  const [selectedVillage, setSelectedVillage] = useState<string | undefined>()

  useEffect(() => {
    fetchData("/api/province").then(setProvinces)
  }, [])

   // Fetch Kota/Kabupaten saat Provinsi dipilih
   useEffect(() => {
    if (selectedProvince) {
      fetchData(`/api/regency?provinceId=${selectedProvince}`).then(setCities);
      setSelectedCity(undefined);
      setDistricts([]);
      setVillages([]);
    }
  }, [selectedProvince]);

  // Fetch Kecamatan saat Kota/Kabupaten dipilih
  useEffect(() => {
    if (selectedCity) {
      fetchData(`/api/district?regencyId=${selectedCity}`).then(setDistricts);
      setSelectedDistrict(undefined);
      setVillages([]);
    }
  }, [selectedCity]);

  // Fetch Kelurahan saat Kecamatan dipilih
  useEffect(() => {
    if (selectedDistrict) {
      fetchData(`/api/village?districtId=${selectedDistrict}`).then(setVillages);
      setSelectedVillage(undefined);
    }
  }, [selectedDistrict]);

  return (
    <div className="w-lg">
      <h3 className="text-lg tracking-widest mb-3">Address</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label>Province</Label>
          <AddressDropdown 
            items={provinces} 
            label="Province" 
            selectedId={selectedProvince} 
            onSelect={(item) => {
              setSelectedProvince(item.id)
              setSelectedCity(undefined)
              setSelectedDistrict(undefined)
              setSelectedVillage(undefined)
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>City</Label>
          <AddressDropdown 
            items={cities} 
            label="City" 
            selectedId={selectedCity} 
            onSelect={(item) => {
              setSelectedCity(item.id)
              setSelectedDistrict(undefined)
              setSelectedVillage(undefined)
            }}
            disabled={!selectedProvince}
          />        
        </div>
        <div className="flex flex-col gap-2">
          <Label>District</Label>
          <AddressDropdown 
            items={districts} 
            label="District" 
            selectedId={selectedDistrict} 
            onSelect={(item) => {
              setSelectedDistrict(item.id)
              setSelectedVillage(undefined)
            }}
            disabled={!selectedCity}
          />        
        </div>
        <div className="flex flex-col gap-2">
          <Label>Villages</Label>
          <AddressDropdown 
            items={villages} 
            label="Villages" 
            selectedId={selectedVillage} 
            onSelect={(item) => {
              setSelectedVillage(item.id)
            }}
            disabled={!selectedDistrict}
          />
        </div>
      </div>

    </div>
  );
}
 
export default AddressForm;