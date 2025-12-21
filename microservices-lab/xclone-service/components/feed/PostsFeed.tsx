"use client";

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Post from './Post';
import Loading from '../ui/Loading';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PostsFeed({ refreshKey }: { refreshKey?: number }) {
  const { data: posts, error, mutate } = useSWR('/api/posts', fetcher);

  // Refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey !== undefined) {
      mutate();
    }
  }, [refreshKey, mutate]);

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-neutral-500">Failed to load posts</p>
      </div>
    );
  }

  if (!posts) {
    return <Loading />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-neutral-500">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post: any) => (
        <Post 
          key={post.id} 
          post={post} 
          onUpdate={() => mutate()}
        />
      ))}
    </div>
  );
}
