"use client";

import Image from "next/image";
import Link from "next/link";
import { IoCalendarOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { fetchUserByUsername } from "@/lib/userUtils";
import { useFollowContext } from "@/contexts/FollowContext";
import EditProfileModal from "../model/EditProfileModal";
import UnfollowModal from "../model/UnfollowModal";
import FollowButton from "../ui/FollowButton";
import IconButton from "../ui/IconButton";
import { useUnfollowModal } from "@/hooks/useUnfollowModal";

interface User {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  createdAt?: string;
  followerIds?: string[];
  followingIds?: string[];
  followersCount?: number;
  followingCount?: number;
}

interface ProfileInfoProps {
  displayName: string;
  displayUsername: string;
  isOwnProfile: boolean;
  user?: User;
}

// Global flag to prevent multiple components from updating counts
let isUpdatingCounts = false;

export default function ProfileInfo({ displayName, displayUsername, isOwnProfile, user }: ProfileInfoProps) {
  const { data: session } = useSession();
  const { performFollow, followingCount: contextFollowingCount, followersCount: contextFollowersCount, updateFollowerCount } = useFollowContext();
  
  const followingCount = useMemo(() => {
    if (isOwnProfile) {
      return 0; // Will be set by useEffect when fetching stats
    }
    return user?.followingIds?.length || 0;
  }, [isOwnProfile, user?.followingIds]);
  
  const [followerCountAdjustment, setFollowerCountAdjustment] = useState(0);
  
  const localFollowersCount = useMemo(() => {
    if (!isOwnProfile && user?.followersCount !== undefined) {
      return user.followersCount + followerCountAdjustment;
    }
    return followerCountAdjustment;
  }, [user, isOwnProfile, followerCountAdjustment]);
  const joinedDate = useMemo(() => {
    let dateToFormat = null;
    
    if (isOwnProfile) {
      // Will be set by useEffect when profile data is fetched
      return '';
    } else if (user?.createdAt) {
      dateToFormat = user.createdAt;
    }
    
    if (dateToFormat) {
      const date = new Date(dateToFormat);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    
    return '';
  }, [isOwnProfile, user]);

  const [joinedDateForOwnProfile, setJoinedDateForOwnProfile] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const { modal: unfollowModal, openModal, closeModal } = useUnfollowModal();

  const getRandomColor = (userId: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFollow = async () => {
    if (!user?.id) return;
    
    if (isFollowing) {
      openModal(user.id, user.username);
    } else {
      const result = await performFollow(user.id);
      // Don't update anything here - context handles all updates
    }
  };

  const confirmUnfollow = async () => {
    const result = await performFollow(unfollowModal.userId);
    if (result !== null) {
      setIsFollowing(result);
    }
    closeModal();
  };

  // Check initial follow state when user data loads
  useEffect(() => {
    if (!isOwnProfile && user?.id && session?.user?.email) {
      // Get current user's following list to check if already following this user
      fetchUserByUsername(session.user.email.split('@')[0])
        .then(currentUser => {
          if (currentUser && currentUser.followingIds) {
            setIsFollowing(currentUser.followingIds.includes(user.id));
          }
        })
        .catch(console.error);
    }
  }, [user, session, isOwnProfile]);
  
  const initialProfileData = useMemo(() => {
    if (isOwnProfile) {
      return {
        name: displayName,
        bio: '',
        profileImage: session?.user?.image || '',
        coverImage: ''
      };
    } else if (user) {
      return {
        name: user.name || displayName,
        bio: user.bio || '',
        profileImage: user.image || '',
        coverImage: user.coverImage || ''
      };
    }
    return {
      name: displayName,
      bio: '',
      profileImage: '',
      coverImage: ''
    };
  }, [isOwnProfile, user, displayName, session?.user?.image]);

  const [profileData, setProfileData] = useState(initialProfileData);

  const handleSaveProfile = async (data: { name: string; bio: string; profileImage?: string; coverImage?: string }) => {
    try {
      const response = await fetch('/api/profile', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
      });
      
      if (response.ok) {
        setProfileData(prev => ({ 
          ...prev, 
          ...data,
          profileImage: data.profileImage || prev.profileImage
        }));
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  useEffect(() => {
    if (isOwnProfile && session?.user?.email) {
      // Only fetch additional profile data for own profile
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setProfileData(prev => ({
              ...prev,
              name: userData.name || prev.name,
              bio: userData.bio || '',
              profileImage: userData.image || prev.profileImage,
              coverImage: userData.coverImage || ''
            }));
            
            // Format the joined date for own profile
            if (userData.createdAt) {
              const date = new Date(userData.createdAt);
              const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              });
              setJoinedDateForOwnProfile(formattedDate);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };
      fetchProfile();
    }
  }, [isOwnProfile, session?.user?.email]);

  return (
    <>
      {/* Cover Image */}
      <div className="relative h-48 bg-neutral-800 overflow-hidden">
        {profileData.coverImage && (
          <Image
            src={profileData.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="relative px-4 pb-4">
      {/* Profile Picture */}
      <div className="absolute -top-16 left-4 border-4 border-black rounded-full w-32 h-32 overflow-hidden">
        <div className={`w-full h-full flex items-center justify-center ${profileData.profileImage ? "bg-gray-600" : getRandomColor(user?.id || "default")}`}>
          {profileData.profileImage ? (
            <Image
              src={profileData.profileImage}
              alt={profileData.name || displayName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-3xl">
              {(profileData.name || displayName)?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        {isOwnProfile ? (
          <IconButton 
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            className="px-6 py-2"
          >
            Edit profile
          </IconButton>
        ) : (
          <FollowButton 
            isFollowing={isFollowing}
            onClick={handleFollow}
            className="px-6 py-2"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold">{isOwnProfile ? profileData.name : (user?.name || displayName)}</h2>
        <p className="text-neutral-500">@{isOwnProfile ? (session?.user?.email?.split('@')[0] || displayUsername) : (user?.username || displayUsername)}</p>
        {(isOwnProfile ? profileData.bio : user?.bio) && (
          <p className="text-white mt-3">{isOwnProfile ? profileData.bio : user?.bio}</p>
        )}

        <div className="flex items-center gap-2 mt-3 text-neutral-500">
          <IoCalendarOutline size={16} />
          <span className="text-sm">Joined {isOwnProfile ? joinedDateForOwnProfile : joinedDate}</span>
        </div>

        <div className="flex gap-6 mt-3">
          <Link href={`/${isOwnProfile ? (session?.user?.email?.split('@')[0] || displayUsername) : (user?.username || displayUsername)}/following`} className="text-sm hover:underline cursor-pointer">
            <span className="font-bold text-white">{isOwnProfile ? contextFollowingCount : followingCount}</span>{" "}
            <span className="text-neutral-500">Following</span>
          </Link>
          <Link href={`/${isOwnProfile ? (session?.user?.email?.split('@')[0] || displayUsername) : (user?.username || displayUsername)}/followers`} className="text-sm hover:underline cursor-pointer">
            <span className="font-bold text-white">{isOwnProfile ? contextFollowersCount : localFollowersCount}</span>{" "}
            <span className="text-neutral-500">Followers</span>
          </Link>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        initialValues={{
          name: profileData.name,
          bio: profileData.bio,
          avatarUrl: profileData.profileImage,
          coverImage: profileData.coverImage
        }}
      />

      <UnfollowModal
        isOpen={unfollowModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmUnfollow}
        username={unfollowModal.username}
      />
      </div>
    </>
  );
}