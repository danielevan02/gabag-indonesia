import { Button } from "@/components/ui/button";
import Link from "next/link";
import CarouselDataTableWrapper from "./components/carousel-data-table-wrapper";
import { trpc } from "@/trpc/server";

export default async function CarouselPage() {
  const carousels = await trpc.carousel.getAll();

  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Carousel List</h1>
        <Button>
          <Link href="/admin/carousel/add">Add Carousel</Link>
        </Button>
      </div>

      <div className="overflow-hidden flex flex-col flex-1">
        <CarouselDataTableWrapper carousels={carousels} />
      </div>
    </div>
  );
}