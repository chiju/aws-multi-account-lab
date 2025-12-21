interface LoadingProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loading({ 
  message = "Loading...", 
  className = "", 
  fullScreen = true 
}: LoadingProps) {
  if (!fullScreen) {
    return (
      <div className={`text-neutral-500 ${className}`}>
        {message}
      </div>
    );
  }

  return (
    <div className={`bg-black text-white min-h-screen ${className}`}>
      <div className="flex items-center justify-center pt-20">
        <div className="text-neutral-500">{message}</div>
      </div>
    </div>
  );
}
