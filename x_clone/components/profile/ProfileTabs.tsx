"use client";

interface ProfileTabsProps {
  activeTab: string;
  isOwnProfile?: boolean;
  username: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, isOwnProfile = true, username, onTabChange }: ProfileTabsProps) {
  const tabs = isOwnProfile 
    ? ["Posts", "Replies", "Highlights", "Articles", "Media", "Likes"]
    : ["Posts", "Replies", "Media"];

  return (
    <div className="border-b border-neutral-800">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-neutral-900/50 ${
              activeTab === tab
                ? "text-white"
                : "text-neutral-500"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full" 
                style={{ width: `${tab.length * 8}px` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
