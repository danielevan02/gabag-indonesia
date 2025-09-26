"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser, updateProfile } from "@/lib/actions/user.action";
import { useEdgeStore } from "@/lib/edge-store";
import { RouterOutputs } from "@/trpc/routers/_app";
import { Loader } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const ImageForm = ({ user }: { user: RouterOutputs['auth']['getCurrentUser'] }) => {
  const [image, setImage] = useState('')
  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState<number>()
  const [isLoading, startTransition] = useTransition()
  const {edgestore} = useEdgeStore()

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0])
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader();
      
      reader.onload = () => {
        setImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  }
  
  const uploadPhoto = async () => {
    startTransition(async () => {
      if (file && user?.name) {
        const fileExt = file.name.split('.').pop(); 
        const safeUserName = user.name.replace(/\s+/g, '_').toLowerCase();
        const newFileName = `${safeUserName}-profilePhoto-${Date.now()}.${fileExt}`;
    
        const renamedFile = new File([file], newFileName, {
          type: file.type,
        });
    
        const res = await edgestore.publicImages.upload({
          file: renamedFile,
          onProgressChange(progress) {
            setProgress(progress);
          },
          options: {
            manualFileName: newFileName
          }
        });
  
        const profileRes = await updateProfile({image: res.url, userId: user.id})
  
        if(profileRes.success){
          setFile(undefined)
          setImage('')
          setProgress(undefined)
          toast.success(profileRes.message as string)
        } else {
          toast.error(profileRes.message as string)
        }
    
        setImage(res.url);
      }
    })
  };


  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="relative rounded-full w-1/2 min-w-72 aspect-square overflow-hidden">
        <Image
          src={ image || user?.image || "/images/user-placeholder.png"}
          alt={user?.name || "User Profile"}
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />

        {progress && (
          <div className="absolute inset-0 z-10 bg-background/70 flex items-center">
            <Progress value={progress}/>
          </div>
        )}
      </div>

      {file ? (
        <div className="flex gap-2 w-56">
          <Button 
            className="uppercase tracking-widest flex-1" 
            variant='outline' 
            onClick={()=>{
              setFile(undefined)
              setImage('')
            }}
          >
            cancel
          </Button>
          <Button className="uppercase tracking-widest flex-1" onClick={uploadPhoto} disabled={isLoading}>
            {isLoading ? (
              <Loader className="w-3 h-3 animate-spin"/>
            ):(
              "save"
            )}
          </Button>
        </div>
      ):(
        <div className="w-56">
          <div className="relative flex items-center justify-center">
            <Input 
              accept="image/*" 
              type="file" 
              className="file:hidden text-transparent" 
              onChange={(e) => handleChangeImage(e)}
            />
            <p className="absolute pointer-events-none">Change Profile Picture</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
