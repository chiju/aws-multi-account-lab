import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import IconButton from "./IconButton";

interface HeaderProps {
  title: string | React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

interface BackButtonProps {
  onBackClick?: () => void;
  backHref: string;
}

function BackButton({ onBackClick, backHref }: BackButtonProps) {
  if (onBackClick) {
    return (
      <IconButton onClick={onBackClick}>
        <IoArrowBack size={20} />
      </IconButton>
    );
  }
  return (
    <Link href={backHref}>
      <IconButton>
        <IoArrowBack size={20} />
      </IconButton>
    </Link>
  );
}

export default function Header({ 
  title, 
  showBackButton = true, 
  backHref = "/", 
  onBackClick,
  rightContent,
  className = "",
  children
}: HeaderProps) {
  return (
    <div className={`sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50 ${className}`}>
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-4">
          {showBackButton && <BackButton onBackClick={onBackClick} backHref={backHref} />}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
