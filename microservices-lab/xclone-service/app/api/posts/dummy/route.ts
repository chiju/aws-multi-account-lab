import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [postsResponse, usersResponse] = await Promise.all([
      fetch('https://dummyjson.com/posts'),
      fetch('https://dummyjson.com/users')
    ]);
    
    const postsData = await postsResponse.json();
    const usersData = await usersResponse.json();
    
    // Create user lookup
    const userLookup = usersData.users.reduce((acc: any, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    // Format dummy posts with original data
    const formattedPosts = postsData.posts.map((post: any) => {
      const user = userLookup[post.userId];
      return {
        id: `dummy_${post.id}`,
        body: post.body,
        createdAt: new Date(Date.now() - (post.id * 3600000)).toISOString(), // Spread over time
        likedIds: Array(post.reactions?.likes || 0).fill('dummy_like'), // Original like count
        user: {
          id: `dummy_user_${post.userId}`,
          name: user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`,
          username: user ? user.username : `user${post.userId}`,
          image: null // Use color avatars
        },
        comments: [],
        isDummy: true,
        originalData: {
          views: post.views || Math.floor(Math.random() * 1000),
          reactions: post.reactions,
          tags: post.tags
        }
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Failed to fetch dummy posts:', error);
    return NextResponse.json([]);
  }
}
