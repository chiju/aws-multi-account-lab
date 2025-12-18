"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WhoToFollow from "./WhoToFollow";
import { IoLockClosed } from "react-icons/io5";

interface Post {
  id: string;
  body: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
}

interface ProfileContentProps {
  activeTab: string;
  user?: User;
  isOwnProfile?: boolean;
}

export default function ProfileContent({ activeTab, user, isOwnProfile }: ProfileContentProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Always call useEffect, but conditionally execute logic inside
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isOwnProfile && (activeTab === "Posts" || activeTab === "Replies") && user?.id) {
      fetchUserPosts();
    }
  }, [activeTab, user?.id, isOwnProfile]);

  // For own profile, show WhoToFollow for Posts and Replies
  if (isOwnProfile && (activeTab === "Posts" || activeTab === "Replies")) {
    return <WhoToFollow compact={false} showBio={true} />;
  }

  // For other user's profile, fetch and show their posts
  if (!isOwnProfile && (activeTab === "Posts" || activeTab === "Replies")) {
    if (loading) {
      return <div className="p-8 text-center text-neutral-500">Loading posts...</div>;
    }

    if (posts.length === 0) {
      return (
        <div className="py-12">
          <div className="max-w-md mx-auto px-10 text-center">
            <h2 className="text-white text-3xl font-bold mb-3">
              {activeTab === "Posts" ? "No posts yet" : "No replies yet"}
            </h2>
            <p className="text-neutral-500 text-base leading-relaxed">
              {activeTab === "Posts" 
                ? "When they post something, it will show up here." 
                : "When they reply to posts, it will show up here."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-neutral-800">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-neutral-800 p-4 hover:bg-neutral-950/50">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-600 shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{post.user?.name}</span>
                  <span className="text-neutral-500">@{post.user?.username}</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white">{post.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Special handling for Likes tab with privacy notice
  if (activeTab === "Likes") {
    return (
      <div>
        {/* Privacy Notice Bar */}
        <div className="bg-blue-900/30 mx-1 mt-1 p-3 rounded-lg flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <IoLockClosed className="text-white text-xs" />
          </div>
          <span className="text-blue-300 text-sm">Your likes are private. Only you can see them.</span>
        </div>
        
        {/* Content */}
        <div className="py-12">
          <div className="max-w-md mx-auto px-10 text-left">
            <h2 className="text-white text-3xl font-bold mb-3">You don&apos;t have any likes yet</h2>
            <p className="text-neutral-500 text-base leading-relaxed mb-6">Tap the heart on any post to show it some love. When you do, it&apos;ll show up here.</p>
          </div>
        </div>
      </div>
    );
  }

  const getTabContent = () => {
    switch (activeTab) {
      case "Highlights":
        return {
          title: "Highlight on your profile",
          subtitle: "You must be subscribed to Premium to highlight posts on your profile.",
          showButton: true,
          buttonText: "Subscribe to Premium",
          buttonStyle: "bg-white text-black hover:bg-neutral-200"
        };
      case "Articles":
        return {
          title: "Write Articles on X",
          subtitle: "You must be subscribed to Premium+ to write Articles on X",
          showButton: true,
          buttonText: "Upgrade to Premium+",
          buttonStyle: "bg-white text-black hover:bg-neutral-200"
        };
      case "Media":
        return {
          title: "Lights, camera … attachments!",
          subtitle: isOwnProfile 
            ? "When you post photos or videos, they will show up here."
            : "When they post photos or videos, they will show up here.",
          showButton: false
        };
      default:
        return {
          title: "No content yet",
          subtitle: "Content will appear here.",
          showButton: false
        };
    }
  };

  const content = getTabContent();

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto px-10 text-left">
        <h2 className="text-white text-3xl font-bold mb-3">{content.title}</h2>
        <p className="text-neutral-500 text-base leading-relaxed mb-6">{content.subtitle}</p>
        
        {content.showButton && (
          <Link href="/premium_sign_up" className={`inline-block px-8 py-3 rounded-full font-bold text-base transition-colors ${content.buttonStyle}`}>
            {content.buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
