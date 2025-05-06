const Loading = () => {
  return (
    <div className="absolute flex flex-col gap-2 bg-background justify-center items-center w-screen h-screen">
      <div className="relative">
        <span className="absolute text-white w-full h-full flex items-center justify-center z-50">
          <h2 className="text-4xl font-extrabold">G</h2>
          <div className="w-2 h-2 rounded-full bg-white translate-y-2"/>
        </span>
        <span className="loader"></span>
      </div>
      <span className="font-light tracking-wider">Loading...</span>
    </div>
  );
}
 
export default Loading;