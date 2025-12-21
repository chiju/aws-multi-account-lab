"use client";

import { useRouter } from "next/navigation";
import { IoSettingsOutline } from "react-icons/io5";
import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

interface ConnectHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ConnectHeader({ activeTab, setActiveTab }: ConnectHeaderProps) {
  const router = useRouter();

  const rightContent = (
    <IconButton>
      <IoSettingsOutline size={20} />
    </IconButton>
  );

  const handleBackClick = () => router.back();

  return (
    <Header 
      title="Connect"
      rightContent={rightContent}
      onBackClick={handleBackClick}
      className="bg-black/30 py-1"
    >
      {/* Tabs */}
      <div className="flex">
        {["Who to follow", "Creators for you"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === tab
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300"
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
    </Header>
  );
}
