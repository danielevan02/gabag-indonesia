const Loading = () => {
  return (
    <div className="absolute flex flex-col gap-2 bg-background justify-center items-center w-screen h-screen">
      <div className="flex gap-1 items-center">
        <div className="w-1.5 h-12 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]"/>
        <div className="w-1.5 h-12 bg-blue-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]"/>
        <div className="w-1.5 h-12 bg-indigo-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]"/>
        <div className="w-1.5 h-12 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]"/>
      </div>
      <span className="font-light tracking-wider">Loading...</span>
    </div>
  );
};

export default Loading;
