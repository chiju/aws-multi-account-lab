"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { BsThreeDots } from 'react-icons/bs';
import Avatar from '../ui/Avatar';
import UnifiedModal from '../ui/UnifiedModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PostProps {
  post: {
    id: string;
    body: string;
    createdAt: string;
    likedIds: string[];
    repostIds?: string[];
    views?: number;
    user: {
      id: string;
      name: string;
      username: string;
      image?: string;
    };
    comments: Array<{
      id: string;
      body: string;
      createdAt: string;
      likedIds: string[];
      user: {
        id: string;
        name: string;
        username: string;
        image?: string;
      };
    }>;
  };
  onUpdate?: () => void;
}

export default function Post({ post, onUpdate }: PostProps) {
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likedIds.length);
  const [repostCount, setRepostCount] = useState(post.repostIds?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [viewCount, setViewCount] = useState(post.views || 0);
  const [comments, setComments] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Get current user ID and set like state
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch('/api/user/current');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
          setIsLiked(post.likedIds.includes(userData.id));
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    
    getCurrentUser();
  }, [session?.user?.email, post.likedIds]);

  const handleLike = async () => {
    if (!session?.user?.email) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like post');
      }

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        toast.success(data.isLiked ? 'Post liked!' : 'Post unliked!');
      }
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error(error.message || 'Failed to like post');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!session?.user?.email) {
      toast.error('Please log in to like comments');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like comment');
      }

      if (data.success) {
        // Update local comment state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likedIds: data.likedIds }
              : comment
          )
        );
        toast.success(data.isLiked ? 'Comment liked!' : 'Comment unliked!');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      const response = await axios.post(`/api/posts/${post.id}/comments`, { body: newComment });
      setNewComment('');
      setShowCommentModal(false);
      
      // Add new comment to local state
      if (response.data.comment) {
        setComments(prevComments => [...prevComments, response.data.comment]);
        setCommentCount(prev => prev + 1);
      }
      
      toast.success('Reply posted!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <>
      <div className="border-b border-neutral-800 p-4 hover:bg-neutral-900/50 transition">
      <div className="flex space-x-3">
        <Avatar userId={post.user.id} src={post.user.image} alt={post.user.name || post.user.username} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/${post.user.username}/status/${post.id}`} className="flex-1 cursor-pointer">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white">{post.user.name}</h3>
                <span className="text-neutral-500">@{post.user.username}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-500 text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
            
            <div className="ml-auto">
              <BsThreeDots className="text-neutral-500 hover:text-white cursor-pointer" />
            </div>
          </div>
          
          <Link href={`/${post.user.username}/status/${post.id}`} className="block cursor-pointer">
            <p className="text-white mt-2">{post.body}</p>
          </Link>
          
          <div className="ml-0">
            {/* Views count like original X */}
            <div className="text-gray-500 text-sm mt-3 mb-3">
              <span>{viewCount?.toLocaleString() || 0} Views</span>
            </div>
            
            {/* Post interaction buttons - exact X layout */}
            <div className="flex items-center justify-between mt-3 text-gray-500">
              <div className="flex items-center gap-16">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCommentModal(true);
                  }}
                  className="flex items-center gap-1 cursor-pointer group hover:bg-blue-500/10 rounded-full p-2 -m-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className="fill-gray-500 group-hover:fill-blue-500" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                  </svg>
                  <span className="group-hover:text-blue-500 text-sm">{commentCount || ""}</span>
                </button>
                
                <button className="flex items-center gap-1 cursor-pointer group hover:bg-green-500/10 rounded-full p-2 -m-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className="fill-gray-500 group-hover:fill-green-500" d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"/>
                  </svg>
                  <span className="group-hover:text-green-500 text-sm">{repostCount || ""}</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="flex items-center gap-1 cursor-pointer group hover:bg-pink-500/10 rounded-full p-2 -m-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className={`group-hover:fill-pink-500 ${isLiked ? 'fill-pink-500' : 'fill-gray-500'}`} d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                  </svg>
                  <span className={`group-hover:text-pink-500 text-sm ${isLiked ? 'text-pink-500' : ''}`}>{likeCount || ""}</span>
                </button>
                
                <button className="flex items-center gap-1 cursor-pointer group hover:bg-blue-500/10 rounded-full p-2 -m-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className="fill-gray-500 group-hover:fill-blue-500" d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                  </svg>
                  <span className="group-hover:text-blue-500 text-sm">{viewCount?.toLocaleString() || ""}</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="cursor-pointer group hover:bg-blue-500/10 rounded-full p-2 -m-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className="fill-gray-500 group-hover:fill-blue-500" d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>
                  </svg>
                </button>
                
                <button className="cursor-pointer group hover:bg-blue-500/10 rounded-full p-2 -m-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path className="fill-gray-500 group-hover:fill-blue-500" d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="flex space-x-3">
              <Avatar 
                userId={currentUserId || ''} 
                src={session?.user?.image || null} 
                alt={session?.user?.name || 'User'} 
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full bg-transparent text-white placeholder-neutral-500 resize-none border-none outline-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="bg-sky-500 text-white px-4 py-1 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-600 transition"
                  >
                    {isCommenting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar userId={comment.user.id} src={comment.user.image} alt={comment.user.name || comment.user.username} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{comment.user.name}</span>
                      <span className="text-neutral-500 text-sm">@{comment.user.username}</span>
                      <span className="text-neutral-500 text-sm">·</span>
                      <span className="text-neutral-500 text-sm">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-white text-sm mt-1">{comment.body}</p>
                    
                    {/* Comment Interaction Buttons */}
                    <div className="flex items-center gap-16 mt-2 text-gray-500">
                      <button className="flex items-center gap-1 cursor-pointer group hover:bg-blue-500/10 rounded-full p-1 -m-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                          <path className="fill-gray-500 group-hover:fill-blue-500" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                        </svg>
                      </button>
                      
                      <button className="flex items-center gap-1 cursor-pointer group hover:bg-green-500/10 rounded-full p-1 -m-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                          <path className="fill-gray-500 group-hover:fill-green-500" d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"/>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCommentLike(comment.id);
                        }}
                        className="flex items-center gap-1 cursor-pointer group hover:bg-pink-500/10 rounded-full p-1 -m-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                          <path className={`group-hover:fill-pink-500 ${comment.likedIds?.includes(currentUserId || '') ? 'fill-pink-500' : 'fill-gray-500'}`} d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                        </svg>
                        <span className={`group-hover:text-pink-500 text-sm ${comment.likedIds?.includes(currentUserId || '') ? 'text-pink-500' : ''}`}>
                          {comment.likedIds?.length || ""}
                        </span>
                      </button>
                      
                      <button className="flex items-center gap-1 cursor-pointer group hover:bg-blue-500/10 rounded-full p-1 -m-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                          <path className="fill-gray-500 group-hover:fill-blue-500" d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Comment Modal */}
      <UnifiedModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setNewComment('');
        }}
        showCloseButton={false}
        className="max-w-xl"
      >
        {/* Close Button - Top Left Corner */}
        <button
          onClick={() => {
            setShowCommentModal(false);
            setNewComment('');
          }}
          className="absolute top-4 left-4 p-2 hover:bg-neutral-900 rounded-full transition-colors z-10"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Original Post in Modal */}
        <div className="pb-4 mb-4 pt-12">
          <div className="flex space-x-3">
            <Avatar userId={post.user.id} src={post.user.image} alt={post.user.name || post.user.username} />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{post.user.name}</span>
                <span className="text-neutral-500">@{post.user.username}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-500 text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-white mt-2">{post.body}</p>
              <p className="text-neutral-500 text-sm mt-3">
                Replying to <span className="text-sky-500">@{post.user.username}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reply Section */}
        <div className="flex space-x-3 items-start">
          <Avatar 
            userId={currentUserId || ''} 
            src={session?.user?.image} 
            alt={session?.user?.name || 'User'} 
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-transparent text-white text-xl placeholder-neutral-500 resize-none border-none outline-none mt-1"
              rows={4}
              maxLength={280}
            />
            
            <div className="flex items-center justify-end mt-4">
              <button
                onClick={handleComment}
                disabled={!newComment.trim() || isCommenting || newComment.length > 280}
                className={`font-bold rounded-full py-2 px-6 transition ${
                  newComment.trim() && !isCommenting
                    ? 'bg-white text-black hover:bg-neutral-200' 
                    : 'bg-neutral-400 text-black'
                }`}
              >
                {isCommenting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </UnifiedModal>
    </>
  );
}
