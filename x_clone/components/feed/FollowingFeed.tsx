"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "../ui/Loading";
import Post from "./Post";

interface PostData {
  id: string;
  body: string;
  createdAt: string;
  likedIds: string[];
  repostIds?: string[];
  views?: number;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    likedIds: string[];
    user: {
      id: string;
      name: string;
      username: string;
      image?: string;
    };
  }>;
}

export default function FollowingFeed() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowingPosts = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/posts/following');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch following posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowingPosts();

    // Listen for follow state changes to refresh feed
    const handleFollowStateChange = () => {
      fetchFollowingPosts();
    };

    window.addEventListener('followStateChanged', handleFollowStateChange);
    return () => window.removeEventListener('followStateChanged', handleFollowStateChange);
  }, [session]);

  if (loading) {
    return <Loading message="Loading posts from people you follow..." className="p-8 text-center" fullScreen={false} />;
  }

  if (posts.length === 0) {
    return (
      <div className="mx-32 mt-10">
        <h2 className="text-3xl font-bold mb-4">Welcome to X!</h2>
        <p className="text-neutral-500 mb-6 max-w-md">
          This is the best place to see what&apos;s happening in your world. Find some people and topics to follow now.
        </p>
        <Link href="/connect" className="bg-sky-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-sky-600 transition-colors inline-block">
          Let&apos;s go!
        </Link>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onUpdate={fetchFollowingPosts}
        />
      ))}
    </div>
  );
}
