import { ReactNode } from "react";

interface CameraOverlayProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "p-2",
  md: "p-3",
  lg: "p-4"
};

export default function CameraOverlay({ 
  children, 
  size = "md", 
  className = "" 
}: CameraOverlayProps) {
  return (
    <div className={`bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-colors ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}
