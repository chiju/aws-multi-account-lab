"use client";

interface FollowButtonProps {
  isFollowing: boolean;
  onClick: () => void;
  className?: string;
}

export default function FollowButton({ isFollowing, onClick, className = "" }: FollowButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`py-1 px-4 font-semibold rounded-full transition-colors group ${
        isFollowing 
          ? 'bg-black border border-neutral-600 text-white hover:text-red-500 hover:border-red-500' 
          : 'bg-white text-black hover:bg-neutral-200'
      } ${className}`}
    >
      <span className={isFollowing ? 'group-hover:hidden' : ''}>
        {isFollowing ? 'Following' : 'Follow'}
      </span>
      {isFollowing && (
        <span className="hidden group-hover:inline text-red-500">Unfollow</span>
      )}
    </button>
  );
}
