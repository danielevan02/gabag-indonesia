import { trpc } from "@/trpc/server";
import EditCarouselForm from "./components/edit-carousel-form";

interface EditCarouselPageProps {
  params: {
    carouselId: string;
  };
}

export default async function EditCarouselPage({ params }: EditCarouselPageProps) {
  const carousel = await trpc.carousel.getById({ id: params.carouselId });

  return (
    <div className="form-page">
      <div>
        <h1 className="font-medium text-2xl">Edit Carousel</h1>
        <p className="text-muted-foreground">Update carousel information</p>
      </div>

      <EditCarouselForm carousel={carousel} />
    </div>
  );
}