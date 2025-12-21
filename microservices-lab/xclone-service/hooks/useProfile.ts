import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileData {
  image: string;
  name: string;
  username: string;
}

export function useProfile() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData>({
    image: '',
    name: '',
    username: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setProfileData({
              image: userData.image || '',
              name: userData.name || '',
              username: userData.username || session.user.email?.split('@')[0] || ''
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    };

    fetchProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [session?.user?.email]);

  return profileData;
}
