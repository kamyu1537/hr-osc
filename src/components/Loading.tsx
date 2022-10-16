const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-bounce">
          <div className="bg-white w-5 h-5 animate-spin">&nbsp;</div>
        </div>

        <div className="mt-3">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
