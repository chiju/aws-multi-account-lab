"use client";

import { useState } from "react";
import Share from "@/components/layouts/Share";
import FollowingFeed from "@/components/feed/FollowingFeed";
import PostsFeed from "@/components/feed/PostsFeed";

const Homepage = () => {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("following");
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 backdrop-blur-md bg-black/80 flex justify-center font-semibold border-b border-b-neutral-800">
        {/* TAB 1: FOR YOU */}
        <div className="flex-1 flex justify-center px-4 pt-4 hover:bg-[#181818]">
          <button
            onClick={() => setActiveTab("for-you")}
            className={`pb-3 flex items-center relative ${
              activeTab === "for-you"
                ? "text-neutral-300"
                : "text-neutral-500"
            }`}
          >
            For You
            {activeTab === "for-you" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full w-12" />
            )}
          </button>
        </div>

        {/* TAB 2: FOLLOWING */}
        <div className="flex-1 flex justify-center px-4 pt-4 hover:bg-[#181818]">
          <button
            onClick={() => setActiveTab("following")}
            className={`pb-3 flex items-center relative ${
              activeTab === "following"
                ? "text-neutral-300"
                : "text-neutral-500"
            }`}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full w-16" />
            )}
          </button>
        </div>     
      </div>
      
      <div className="border-b border-neutral-800">
        <Share onPostCreated={handlePostCreated} />
      </div>
      
      {/* Tab Content */}
      {activeTab === "for-you" && (
        <div>
          <PostsFeed refreshKey={refreshKey} />
        </div>
      )}
      
      {activeTab === "following" && (
        <FollowingFeed />
      )}  
    </div>
  );
};

export default Homepage;
