"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Notification {
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

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "mentions">(
    "all"
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);

          // Mark notifications as seen in localStorage
          if (data.length > 0) {
            localStorage.setItem(
              "lastSeenNotifications",
              Date.now().toString()
            );
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotificationBody = (body: string) => {
    // Match @username pattern
    const usernameMatch = body.match(/@(\w+)/);
    if (usernameMatch) {
      const username = usernameMatch[1];
      const beforeUsername = body.substring(0, usernameMatch.index);
      const afterUsername = body.substring(usernameMatch.index! + usernameMatch[0].length);
      
      return (
        <>
          {beforeUsername}
          <Link href={`/${username}`} className="hover:underline">
            @{username}
          </Link>
          {afterUsername}
        </>
      );
    }
    return body;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInWeeks < 4) return `${diffInWeeks}w`;
    
    // More than a month, show "Dec 2025" format
    return date.toLocaleDateString('en-GB', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-neutral-800 z-10">
        <div className="flex items-center justify-between p-3">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-start">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-4 font-medium transition-colors relative hover:bg-neutral-900 ${
              activeTab === "all" ? "text-white" : "text-neutral-500"
            }`}
          >
            All
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full w-8" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Content */}
      <div>
        {loading ? (
          <div className="p-8 text-center text-neutral-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">No notifications yet</h3>
            <p className="text-neutral-500">
              When you get notifications, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          activeTab === "all" &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 hover:bg-neutral-950 transition-colors cursor-pointer border-b border-neutral-800"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0">
                  <Image
                    src="/icons/logo_2.png"
                    alt="X logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-white align-middle font-medium leading-relaxed pr-2">
                      {renderNotificationBody(notification.body)}
                    </p>
                    <span className="text-neutral-500 text-sm shrink-0">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
