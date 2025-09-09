import { getGalleryImages } from "@/lib/actions/gallery.action"
import Gallery from "./components/gallery"

export default async function GalleryPage() {
  const {images} = await getGalleryImages()
  const haveImages = images && images.length !==0
  return (
    <div className="form-page">
      <p className="text-lg font-semibold">Image Gallery</p>
      { haveImages ? (
        <Gallery images={images}/>
      ):(
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/50 italic">There is no image uploaded.</p>
        </div>
      )}
    </div>
  )
}