"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "./ui/Avatar";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

interface CommentsProps {
  postId: string;
  comments: Comment[];
  postOwnerUsername?: string;
}

export default function Comments({ postId, comments, postOwnerUsername }: CommentsProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  // Fetch current user data to get profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/users?username=${session.user.email}`);
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
        }
      }
    };
    fetchCurrentUser();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting comment to:', `/api/posts/${postId}/comments`);
      const response = await axios.post(`/api/posts/${postId}/comments`, { body: comment });
      console.log('Comment response:', response.data);
      setComment("");
      toast.success("Reply posted!");
      router.refresh();
    } catch (error: any) {
      console.error('Comment error:', error.response?.data || error.message);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Reply Form */}
      {session && (
        <div className="p-4 border-b border-neutral-800">
          <div className="text-neutral-500 text-sm mb-3">
            Replying to <span className="text-blue-500">@{postOwnerUsername}</span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Avatar 
              src={currentUser?.image || session.user?.image || null} 
              alt={session.user?.name || "User"}
              fallbackText={session.user?.name?.charAt(0)}
            />
            <div className="flex-1 flex flex-col gap-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Post your reply"
                className="bg-transparent outline-none placeholder:text-neutral-500 text-xl w-full mt-1.5"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between flex-wrap gap-4 mt-1.5">
                <div className="flex gap-4 flex-wrap">
                  <Image src="/icons/image.svg" alt="Image" width={20} height={20} className="cursor-pointer" />
                  <Image src="/icons/gif.svg" alt="GIF" width={20} height={20} className="cursor-pointer" />
                  <Image src="/icons/poll.svg" alt="Poll" width={20} height={20} className="cursor-pointer" />
                  <Image src="/icons/emoji.svg" alt="Emoji" width={20} height={20} className="cursor-pointer" />
                  <Image src="/icons/schedule.svg" alt="Schedule" width={20} height={20} className="cursor-pointer" />
                  <Image src="/icons/location.svg" alt="Location" width={20} height={20} className="cursor-pointer" />
                </div>
                <button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className={`font-bold rounded-full py-1 px-4 transition ${
                    comment.trim() && !isSubmitting
                      ? 'bg-white text-black hover:bg-neutral-200' 
                      : 'bg-neutral-400 text-black'
                  }`}
                >
                  {isSubmitting ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      {!comments || comments.length === 0 ? (
        <div className="p-8 text-neutral-500 text-center">
          No replies yet
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-neutral-800 p-4 hover:bg-neutral-900/50 transition">
              <div className="flex space-x-3">
                <Avatar 
                  userId={comment.user.id} 
                  src={comment.user.image} 
                  alt={comment.user.name || comment.user.username}
                  size={40}
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white">{comment.user.name}</h3>
                    <span className="text-neutral-500">@{comment.user.username}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-500 text-sm">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-white mt-1">{comment.body}</p>
                  
                  <div className="flex items-center space-x-12 mt-3 text-neutral-500">
                    <button className="flex items-center space-x-2 hover:text-blue-500 transition group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path className="fill-gray-500 group-hover:fill-blue-500" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                      </svg>
                      <span className="text-sm">10</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 hover:text-green-500 transition group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path className="fill-gray-500 group-hover:fill-green-500" d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"/>
                      </svg>
                      <span className="text-sm">4</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 hover:text-pink-500 transition group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path className="fill-gray-500 group-hover:fill-pink-500" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                      </svg>
                      <span className="text-sm">343</span>
                    </button>
                    
                    <button className="hover:text-blue-500 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path className="fill-gray-500 hover:fill-blue-500" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
