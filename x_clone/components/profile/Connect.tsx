"use client";

import { useState } from "react";
import ConnectHeader from "./ConnectHeader";
import WhoToFollow from "./WhoToFollow";

export default function Connect() {
  const [activeTab, setActiveTab] = useState("Who to follow");

  return (
    <div className="bg-black text-white">
      <ConnectHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {activeTab === "Who to follow" && (
          <div>
            <h2 className="text-xl font-bold px-4 pt-4 pb-1">Suggested for you</h2>
            <WhoToFollow 
              title="" 
              showMore={false} 
              limit={20} 
              showBio={true}
              compact={true}
            />
          </div>
        )}
        {activeTab === "Creators for you" && (
          <div className="p-8 text-center text-neutral-500">
            <p>Creators for you content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
