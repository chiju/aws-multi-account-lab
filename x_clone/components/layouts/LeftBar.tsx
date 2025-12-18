"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import UnifiedModal from "../ui/UnifiedModal";
import { useProfile } from "@/hooks/useProfile";
import { usePathname } from "next/navigation";

const LeftBar = () => {
  const { data: session } = useSession();
  const { image: profileImage, name: profileName, username } = useProfile();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (session) {
        try {
          const lastSeen = localStorage.getItem('lastSeenNotifications');
          const url = lastSeen 
            ? `/api/notifications/count?lastSeen=${lastSeen}`
            : '/api/notifications/count';
            
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setNotificationCount(data.count);
          }
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      }
    };

    fetchNotificationCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Reset count when visiting notifications page
  useEffect(() => {
    if (pathname === '/notifications') {
      setTimeout(() => setNotificationCount(0), 1000);
    }
  }, [pathname]);

  const displayName = profileName || session?.user?.name || "User";

  const handleLogout = () => {
    toast.success('Logged out successfully');
    setTimeout(() => {
      signOut();
    }, 500);
    setShowLogoutModal(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };

  const menuList = [
    {
      id: 1,
      name: "Home",
      link: "/",
      icon: "home.svg",
      onClick: handleHomeClick,
    },
    {
      id: 3,
      name: "Notifications",
      link: "/notifications",
      icon: "notification.svg",
    },
     {
       id: 9,
       name: "Premium",
       link: "/premium_sign_up",
       icon: "logo_2.png",
     },
    {
      id: 10,
      name: "Profile",
      link: `/${session?.user?.email?.split('@')[0] || 'profile'}`,
      icon: "profile.svg",
    },
  ];

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between pb-2">
      {/* LOGO MENU BUTTON */}
      <div className="flex flex-col gap-4 text-xl items-center xl:items-start">
        {/* LOGO */}
        <button onClick={handleHomeClick} className="p-2 rounded-full hover:bg-[#181818] ">
          <Image src="/icons/logo_2.png" alt="logo" width={35} height={35} />
        </button>
        {/* MENU LIST */}
        <div className="flex flex-col gap-4">
          {menuList.map((item) => (
            item.onClick ? (
              <button
                key={item.id}
                onClick={item.onClick}
                className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4"
              >
                <Image
                  src={`/icons/${item.icon}`}
                  alt={item.name}
                  width={28}
                  height={28}
                />
                <span className="hidden xl:inline text-xl">{item.name}</span>
              </button>
            ) : (
              <Link
                href={item.link}
                className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4 relative"
                key={item.id}
              >
                <div className="relative">
                  <Image
                    src={`/icons/${item.icon}`}
                    alt={item.name}
                    width={28}
                    height={28}
                  />
                  {item.name === "Notifications" && notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                  )}
                </div>
                <span className="hidden xl:inline text-xl">{item.name}</span>
              </Link>
            )
          ))}
        </div>
        {/* BUTTON */}
        <Link
          href="/compose/post"
          className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center xl:hidden hover:bg-neutral-200 transition-colors"
        >
          <Image src="/icons/post.svg" alt="new post" width={32} height={32} />
        </Link>
        <Link
          href="/compose/post"
          className="hidden xl:block bg-white text-black rounded-full font-bold text-sm py-4 px-25 hover:bg-neutral-200"
        >
          Post
        </Link>
      </div>
      {/* USER */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-between xl:justify-start w-full rounded-full hover:bg-[#181818] p-2"
        >
          <div className="flex items-center gap-2">
            <Avatar 
              src={profileImage} 
              alt={displayName || "User"}
              fallbackText={displayName?.charAt(0)}
              className="bg-gray-600"
            />
            <div className="hidden xl:flex flex-col">
              <span className="font-bold text-left">{displayName}</span>
              <span className="text-sm text-neutral-500 text-left">@{username || session?.user?.email?.split('@')[0]}</span>
            </div>
          </div>
          <div className="hidden xl:block cursor-pointer font-bold pl-10">...</div>
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-black border border-neutral-600 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] min-w-[280px] py-2 z-50">
            <button
              onClick={() => {
                setShowUserMenu(false);
                // Add existing account functionality here
              }}
              className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors text-white font-medium"
            >
              Add an existing account
            </button>
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                setShowLogoutModal(true);
              }}
              className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors text-white font-medium"
            >
              Log out @{username || session?.user?.email?.split('@')[0]}
            </button>
            
            {/* Arrow pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neutral-600"></div>
              <div className="w-0 h-0 border-l-7 border-r-7 border-t-7 border-l-transparent border-r-transparent border-t-black absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px"></div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      <UnifiedModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        showLogo={true}
        showCloseButton={false}
        className="max-w-xs w-80"
      >
        <div className="px-6 py-0.5">
          <h3 className="text-xl font-bold mb-2 text-white text-left">Log out of X?</h3>
          
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed text-left">
            You can always log back in at any time. If you just want to switch accounts, you can do that by adding an existing account.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-white text-black rounded-full py-2.5 font-bold hover:bg-neutral-200 transition-colors"
            >
              Log out
            </button>
            
            <button
              onClick={() => setShowLogoutModal(false)}
              className="w-full bg-black border border-neutral-600 text-white rounded-full py-2.5 font-bold hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </UnifiedModal>
    </div>
  );
};

export default LeftBar;
