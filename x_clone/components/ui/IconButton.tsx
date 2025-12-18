import { ReactNode } from "react";

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "p-1",
  md: "p-2", 
  lg: "p-3"
};

const variantClasses = {
  default: "hover:bg-neutral-900",
  primary: "bg-sky-500 hover:bg-sky-600 text-white font-semibold",
  secondary: "bg-neutral-800 hover:bg-neutral-700 text-white font-semibold",
  outline: "border border-neutral-600 text-white font-semibold hover:bg-neutral-900"
};

export default function IconButton({ 
  children, 
  onClick, 
  className = "", 
  size = "md",
  variant = "default",
  fullWidth = false
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
