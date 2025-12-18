"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../ui/Header";
import TabNavigation from "../ui/TabNavigation";
import ProfileCard from "./ProfileCard";
import { fetchUserByUsername, fetchUsersByIds } from "@/lib/userUtils";
import { useFollowContext } from "@/contexts/FollowContext";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
  followingIds?: string[];
  followerIds?: string[];
}

interface FollowListPageProps {
  type: "followers" | "following";
}

export default function FollowListPage({ type }: FollowListPageProps) {
  const params = useParams();
  const username = params.username as string;
  const { performFollow } = useFollowContext();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "followers", label: "Followers", href: `/${username}/followers` },
    { id: "following", label: "Following", href: `/${username}/following` }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const profileUser = await fetchUserByUsername(username);
        if (!profileUser) return;

        let userIds: string[] = [];
        
        if (type === "following") {
          userIds = profileUser.followingIds || [];
        } else {
          // For followers, get all users and find who has this user's ID in their followingIds
          const response = await fetch('/api/users');
          const allUsers: User[] = await response.json();
          userIds = allUsers
            .filter((user) => user.followingIds?.includes(profileUser.id))
            .map((user) => user.id);
        }

        if (userIds.length > 0) {
          const fetchedUsers = await fetchUsersByIds(userIds);
          setUsers(fetchedUsers);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const handleFollowStateChange = () => {
      fetchUsers();
    };

    window.addEventListener('followStateChanged', handleFollowStateChange);
    return () => window.removeEventListener('followStateChanged', handleFollowStateChange);
  }, [username, type]);

  const renderEmptyState = () => {
    if (type === "following") {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Be in the know</h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-md">
            Following accounts is an easy way to curate your timeline and know what&apos;s happening with the topics and people you&apos;re interested in.
          </p>
          <Link 
            href="/connect"
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Find people to follow
          </Link>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for followers?</h2>
          <p className="text-neutral-400 text-lg max-w-md">
            When someone follows this account, they&apos;ll show up here. Posting and interacting with others helps boost followers.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        title={
          <div>
            <div className="text-xl font-bold">{username}</div>
            <p className="text-sm text-neutral-500">@{username}</p>
          </div>
        }
      />
      
      <TabNavigation tabs={tabs} activeTab={type} type="link" />

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-neutral-500">Loading...</div>
          </div>
        ) : users.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="divide-y divide-neutral-800">
            {users.map((user) => (
              <div key={user.id} className="p-4">
                <ProfileCard
                  user={user}
                  showBio={true}
                  onFollow={performFollow}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
