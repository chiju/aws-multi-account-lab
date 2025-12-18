"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchAllUsers } from "@/lib/userUtils";
import { useFollowContext } from "@/contexts/FollowContext";
import ProfileCard from "./ProfileCard";
import Avatar from "../ui/Avatar";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
  isFollowing?: boolean;
}

interface FollowStateChangeDetail {
  userId: string;
  isFollowing: boolean;
}

interface WhoToFollowProps {
  title?: string;
  showMore?: boolean;
  limit?: number;
  className?: string;
  compact?: boolean;
  showBio?: boolean;
}

export default function WhoToFollow({
  title = "Who to follow",
  showMore = true,
  limit = 3,
  className = "",
  compact = false,
  showBio = false,
}: WhoToFollowProps) {
  const { data: session } = useSession();
  const { performFollow } = useFollowContext();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);


  // Listen for follow state changes from other components  
  useEffect(() => {
    const handleFollowStateChange = (event: Event) => {
      const { userId, isFollowing } = (event as CustomEvent<FollowStateChangeDetail>).detail;
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isFollowing } : user
      ));
    };

    window.addEventListener('followStateChanged', handleFollowStateChange);
    return () => window.removeEventListener('followStateChanged', handleFollowStateChange);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await fetchAllUsers();
        const otherUsers = allUsers.filter(
          (user: User) => user.email !== session?.user?.email && !user.isFollowing
        );
        setTotalUsers(otherUsers.length);
        setUsers(otherUsers.slice(0, limit));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session, limit]);

  if (loading) {
    return (
      <div className={`p-4 ${compact ? "" : showBio ? "" : "rounded-2xl border border-neutral-800"} flex flex-col gap-4 ${className}`}>
        <h2 className="font-bold text-xl">{title}</h2>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={null} alt="" className="bg-neutral-700 animate-pulse" />
              <div>
                <div className="h-4 bg-neutral-700 rounded mb-1 w-20"></div>
                <div className="h-3 bg-neutral-700 rounded w-16"></div>
              </div>
            </div>
            <div className="h-8 bg-neutral-700 rounded-full w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`p-4 ${compact ? "" : showBio ? "" : "rounded-2xl border border-neutral-800"} flex flex-col gap-4 ${className}`}>
        <h2 className="font-bold text-xl">{title}</h2>
        <p className="text-neutral-500 text-sm">No users to suggest at the moment.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${compact ? "" : showBio ? "" : "rounded-2xl border border-neutral-800"} flex flex-col gap-4 ${className}`}>
      <h2 className="font-bold text-xl">{title}</h2>

      {users.map((user) => (
        <ProfileCard
          key={user.id}
          user={user}
          showBio={showBio}
          compact={compact}
          onFollow={performFollow}
        />
      ))}

      {showMore && totalUsers > limit && (
        <Link href="/connect" className="text-sky-500 hover:text-sky-600 text-sm transition-colors">
          Show More
        </Link>
      )}
    </div>
  );
}
