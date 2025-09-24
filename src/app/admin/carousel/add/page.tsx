import CarouselForm from "./components/carousel-form";

export default function AddCarouselPage() {
  return (
    <div className="form-page">
      <div>
        <h1 className="font-medium text-2xl">Add Carousel</h1>
        <p className="text-muted-foreground">Create a new carousel for the home page</p>
      </div>

      <CarouselForm />
    </div>
  );
}