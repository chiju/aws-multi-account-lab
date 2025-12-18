"use client";

import Header from "../ui/Header";

interface ProfileHeaderProps {
  displayName: string;
  activeTab: string;
  counts?: {
    Posts: number;
    Replies: number;
    Highlights: number;
    Articles: number;
    Media: number;
    Likes: number;
  };
}

export default function ProfileHeader({ displayName, activeTab, counts }: ProfileHeaderProps) {
  const getHeaderCount = () => {
    const defaultCounts = {
      Posts: 0,
      Replies: 0,
      Highlights: 0,
      Articles: 0,
      Media: 0,
      Likes: 0
    };
    
    const actualCounts = counts || defaultCounts;
    
    switch (activeTab) {
      case "Likes":
        return `${actualCounts.Likes} likes`;
      case "Media":
        return `${actualCounts.Media} photos & videos`;
      default:
        return `${actualCounts.Posts} posts`;
    }
  };

  return (
    <Header 
      title={
        <div>
          <div className="text-xl font-bold">{displayName}</div>
          <p className="text-sm text-neutral-500">{getHeaderCount()}</p>
        </div>
      }
    />
  );
}
