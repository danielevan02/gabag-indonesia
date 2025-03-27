"use client";

import { User } from "@prisma/client";
import { Label } from "./ui/label";
import { AddressDropdown } from "./shared/address-dropdown";
import { useEffect, useState, useTransition } from "react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/schema";
import { Address } from "@/types";
import { updateUserData } from "@/lib/actions/user.action";
import toast from "react-hot-toast";

interface AddressFormProps {
  user?: User;
}

type AddressItem = { id: string; name: string };

async function fetchData(url: string): Promise<AddressItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat data");
  return res.json();
}

const AddressForm: React.FC<AddressFormProps> = ({ user }) => {
  const [isLoading, startTransition] = useTransition();
  const [provinces, setProvinces] = useState<AddressItem[]>([]);
  const [cities, setCities] = useState<AddressItem[]>([]);
  const [districts, setDistricts] = useState<AddressItem[]>([]);
  const [villages, setVillages] = useState<AddressItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false); 

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [selectedVillage, setSelectedVillage] = useState<string | undefined>();

  const userAddress = user?.address
    ? (user.address as Address)
    : {
        province: "",
        address: "",
        district: "",
        postalCode: "",
        regency: "",
        village: "",
      };

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: userAddress,
  });

  useEffect(() => {
    fetchData("/api/province").then(setProvinces);
  }, []);

  
  useEffect(() => {
    if (user?.address && provinces.length > 0 && !isInitialized) {
      console.log("Auto-assigning address...");
  
      // Set Province
      const provinceId = provinces.find((p) => p.name === (user.address as Address).province)?.id;
      setSelectedProvince(provinceId);
  
      // Set Kota/Kabupaten setelah province di-set
      if (provinceId) {
        fetchData(`/api/regency?provinceId=${provinceId}`).then((fetchedCities) => {
          setCities(fetchedCities);
          const cityId = fetchedCities.find((c) => c.name === (user.address as Address).regency)?.id;
          setSelectedCity(cityId);
  
          // Set Kecamatan setelah city di-set
          if (cityId) {
            fetchData(`/api/district?regencyId=${cityId}`).then((fetchedDistricts) => {
              setDistricts(fetchedDistricts);
              const districtId = fetchedDistricts.find((d) => d.name === (user.address as Address).district)?.id;
              setSelectedDistrict(districtId);
  
              // Set Kelurahan setelah district di-set
              if (districtId) {
                fetchData(`/api/village?districtId=${districtId}`).then((fetchedVillages) => {
                  setVillages(fetchedVillages);
                  const villageId = fetchedVillages.find((v) => v.name === (user.address as Address).village)?.id;
                  setSelectedVillage(villageId);
                });
              }
            });
          }
        });
      }
  
      setIsInitialized(true); // Hindari eksekusi ulang
    }
  }, [user?.address, provinces]);

  useEffect(() => {
    if (selectedProvince) {
      // Reset data lama agar UI tidak menampilkan kota lama
      setCities([]);
      setDistricts([]);
      setVillages([]);
      setSelectedCity(undefined);
      setSelectedDistrict(undefined);
      setSelectedVillage(undefined);
  
      // Fetch data kota berdasarkan provinsi yang baru dipilih
      fetchData(`/api/regency?provinceId=${selectedProvince}`).then(setCities);
    }
  }, [selectedProvince]);
  
  useEffect(() => {
    if (selectedCity) {
      // Reset kecamatan dan desa sebelum fetch baru
      setDistricts([]);
      setVillages([]);
      setSelectedDistrict(undefined);
      setSelectedVillage(undefined);
  
      // Fetch data kecamatan berdasarkan kota yang dipilih
      fetchData(`/api/district?regencyId=${selectedCity}`).then(setDistricts);
    }
  }, [selectedCity]);
  
  useEffect(() => {
    if (selectedDistrict) {
      // Reset desa sebelum fetch baru
      setVillages([]);
      setSelectedVillage(undefined);
  
      // Fetch data desa berdasarkan kecamatan yang dipilih
      fetchData(`/api/village?districtId=${selectedDistrict}`).then(setVillages);
    }
  }, [selectedDistrict]);

  const onSubmit: SubmitHandler<Address> = async (data) => {
    startTransition(async () => {
      await updateUserData(user?.id, data);
    });
    toast.success("Address Saved!");
  };
  
  return (
    <form
      className={`
        flex 
        flex-col
        w-full 
        h-full 
        max-w-[692px] 
        max-h-full 
        lg:min-w-full 
        xl:min-w-[692px] 
        `}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className="text-lg tracking-widest mb-3">Address</h3>

      <div className="grid grid-cols-1 grid-rows-2 md:grid-rows-1 md:grid-cols-2 md:gap-5 flex-1 max-w-full w-full overflow-hidden">
        <div className="flex flex-col gap-3 col-span-1 row-span-1">
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest">Province</Label>
            <AddressDropdown
              items={provinces}
              label="Province"
              selectedId={selectedProvince}
              onSelect={(item) => {
                setSelectedProvince(item.id);
                setSelectedCity(undefined);
                setSelectedDistrict(undefined);
                setSelectedVillage(undefined);
                setValue("province", item.name);
              }}
            />
            {errors.province?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.province.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest">City</Label>
            <AddressDropdown
              items={cities}
              label="City"
              selectedId={selectedCity}
              onSelect={(item) => {
                setSelectedCity(item.id);
                setSelectedDistrict(undefined);
                setSelectedVillage(undefined);
                setValue("regency", item.name);
              }}
              disabled={!selectedProvince}
            />
            {errors.regency?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.regency.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest">District</Label>
            <AddressDropdown
              items={districts}
              label="District"
              selectedId={selectedDistrict}
              onSelect={(item) => {
                setSelectedDistrict(item.id);
                setSelectedVillage(undefined);
                setValue("district", item.name);
              }}
              disabled={!selectedCity}
            />
            {errors.district?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.district.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest">Villages</Label>
            <AddressDropdown
              items={villages}
              label="Villages"
              selectedId={selectedVillage}
              onSelect={(item) => {
                setSelectedVillage(item.id);
                setValue("village", item.name);
              }}
              disabled={!selectedDistrict}
            />
            {errors.village?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.village.message}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col col-span-1 row-span-1 max-w-full w-full gap-5">
          <div className="flex flex-col gap-2 h-fit max-w-full w-full">
            <Label className="text-xs uppercase tracking-widest">Address</Label>
            <Textarea
              placeholder="e.g: Jl. Sudirman 5 Blok A no. 10"
              wrap="soft"
              rows={5}
              className="max-w-[330px] min-h-40 max-h-40 resize-none"
              {...register("address")}
            />
            {errors.address?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.address.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest">Postal Code</Label>
            <Input placeholder="e.g: 2331" {...register("postalCode")} />
            {errors.postalCode?.message && (
              <span className="gap-1 text-xs text-red-700">{errors.postalCode.message}</span>
            )}
          </div>
          <Button
            className="rounded-full uppercase tracking-widest py-7"
            type="submit"
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
