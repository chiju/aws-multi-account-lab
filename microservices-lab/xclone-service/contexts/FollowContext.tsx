"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface FollowContextType {
  followingCount: number;
  followersCount: number;
  loading: boolean;
  performFollow: (userId: string) => Promise<boolean | null>;
  refreshCounts: () => Promise<void>;
  updateFollowerCount: (increment: boolean) => void; // For when someone follows/unfollows you
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

interface FollowProviderProps {
  children: ReactNode;
}

export function FollowProvider({ children }: FollowProviderProps) {
  const { data: session } = useSession();
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch current user's follow counts
  const fetchFollowCounts = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(`/api/user/stats?email=${session.user.email}`);
      if (response.ok) {
        const { following, followers } = await response.json();
        setFollowingCount(following);
        setFollowersCount(followers);
      }
    } catch (error) {
      console.error('Failed to fetch follow counts:', error);
    }
  }, [session?.user?.email]);

  // Perform follow/unfollow action
  const performFollow = useCallback(async (userId: string) => {
    if (loading || !session?.user?.email) return null;
    
    setLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId })
      });

      if (response.ok) {
        const { following } = await response.json();
        
        // Update following count immediately
        setFollowingCount(prev => following ? prev + 1 : prev - 1);
        
        // Dispatch event for UI updates in other components (but not count updates)
        window.dispatchEvent(new CustomEvent('followStateChanged', { 
          detail: { userId, isFollowing: following } 
        }));
        
        return following;
      }
      return null;
    } catch (error) {
      console.error('Follow operation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, session?.user?.email]);

  // Initialize counts on mount
  useEffect(() => {
    fetchFollowCounts();
  }, [fetchFollowCounts]);

  // Update follower count when someone follows/unfollows you
  const updateFollowerCount = useCallback((increment: boolean) => {
    setFollowersCount(prev => increment ? prev + 1 : prev - 1);
  }, []);

  const value: FollowContextType = {
    followingCount,
    followersCount,
    loading,
    performFollow,
    refreshCounts: fetchFollowCounts,
    updateFollowerCount,
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollowContext() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
}
