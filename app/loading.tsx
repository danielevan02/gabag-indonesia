import LoadingComponent from "@/components/shared/loading-component";

const Loading = () => {
  return (
    <div className="absolute flex flex-col gap-2 bg-background justify-center items-center w-screen h-screen">
      <LoadingComponent/>
      <span className="font-light tracking-wider">Loading...</span>
    </div>
  );
}
 
export default Loading;