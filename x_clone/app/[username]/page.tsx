"use client";

import { useSession } from "next-auth/react";
import { useState, use, useEffect } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { fetchUserByUsername } from "@/lib/userUtils";

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

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserProfile({ params }: ProfilePageProps) {
  const { username } = use(params);
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Posts");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchUserByUsername(username);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (session?.user?.email?.split('@')[0] === username) {
        const fetchUser = async () => {
          try {
            const userData = await fetchUserByUsername(username);
            setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user:', error);
          }
        };
        fetchUser();
      }
    };

    const handleFollowStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string; isFollowing: boolean }>;
      const { userId } = customEvent.detail;
      
      if (user?.id === userId) {
        const fetchUser = async () => {
          try {
            const userData = await fetchUserByUsername(username);
            setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user:', error);
          }
        };
        fetchUser();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('followStateChanged', handleFollowStateChange);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('followStateChanged', handleFollowStateChange);
    };
  }, [username, session?.user?.email, user?.id]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-neutral-500">User not found</div>;
  }

  const isOwnProfile = user.email === session?.user?.email;

  if (!session?.user?.email) {
    return <div className="p-8 text-center text-neutral-500">Please log in to view profiles</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader displayName={user.name || user.username} activeTab={activeTab} />
      
      <ProfileInfo 
        displayName={user.name || user.username} 
        displayUsername={user.username}
        isOwnProfile={isOwnProfile}
        user={user}
      />
      
      <ProfileTabs 
        activeTab={activeTab} 
        isOwnProfile={isOwnProfile} 
        username={username}
        onTabChange={handleTabChange}
      />
      
      <ProfileContent activeTab={activeTab} user={user} isOwnProfile={isOwnProfile} />
    </div>
  );
}
