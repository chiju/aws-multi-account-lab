"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Avatar from "../ui/Avatar";
import { useProfile } from "@/hooks/useProfile";
import axios from "axios";
import toast from "react-hot-toast";

const Share = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [desc, setDesc] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { data: session } = useSession();
  const { image: profileImage } = useProfile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!desc.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await axios.post('/api/posts', { body: desc });
      toast.success('Post created successfully!');
      setDesc("");
      onPostCreated?.();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form className="p-4 flex gap-4" onSubmit={handleSubmit}>
      {/* AVATAR */}
      <Avatar 
        src={profileImage} 
        alt={session?.user?.name || "User"}
        fallbackText={session?.user?.name?.charAt(0)}
        className="bg-gray-600"
      />

      {/* INPUT + ACTIONS */}
      <div className="flex-1 flex flex-col gap-4">
        <input
          type="text"
          name="desc"
          placeholder="What's happening?"
          value={desc}
          onChange={(e) => setDesc(e.target.value)} 
          className="bg-transparent outline-none placeholder:text-neutral-500 text-xl w-full mt-1.5"
          disabled={isPosting}
        />

        {/* ICONS ROW */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-1.5">
          <div className="flex gap-4 flex-wrap">
            <Image src="/icons/image.svg" alt="Image" width={20} height={20} className="cursor-pointer" />
            <Image src="/icons/gif.svg" alt="GIF" width={20} height={20} className="cursor-pointer" />
            <Image src="/icons/poll.svg" alt="Poll" width={20} height={20} className="cursor-pointer" />
            <Image src="/icons/emoji.svg" alt="Emoji" width={20} height={20} className="cursor-pointer" />
            <Image src="/icons/schedule.svg" alt="Schedule" width={20} height={20} className="cursor-pointer" />
            <Image src="/icons/location.svg" alt="Location" width={20} height={20} className="cursor-pointer" />
          </div>

          {/* POST BUTTON LEFT-ALIGNED */}
          <button
            type="submit"
            disabled={!desc.trim() || isPosting}
            className={`font-bold rounded-full py-1 px-4 transition ${
              desc.trim() && !isPosting
                ? 'bg-white text-black hover:bg-neutral-200' 
                : 'bg-neutral-400 text-black'
            }`}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Share;
