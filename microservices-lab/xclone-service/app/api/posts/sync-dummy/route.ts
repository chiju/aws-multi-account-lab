import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';

export async function POST() {
  try {
    // Fetch dummy posts from external API
    const response = await fetch('https://dummyjson.com/posts');
    const data = await response.json();
    
    // Fetch users data for names
    const usersResponse = await fetch('https://dummyjson.com/users');
    const usersData = await usersResponse.json();
    
    // Check existing dummy posts in DB
    const existingPosts = await prisma.post.findMany({
      where: {
        id: {
          startsWith: 'dummy_'
        }
      }
    });

    const existingPostIds = new Set(existingPosts.map(p => p.id));
    let newPostsCount = 0;

    // Create dummy users with original data
    const dummyUsers = [];
    for (const apiUser of usersData.users) {
      const user = await prisma.user.upsert({
        where: { email: `${apiUser.username}@dummy.com` },
        update: {},
        create: {
          email: `${apiUser.username}@dummy.com`,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          username: apiUser.username,
          bio: apiUser.company?.title || 'Dummy user',
        }
      });
      dummyUsers.push({ ...user, originalId: apiUser.id });
    }

    // Add new posts with original data
    for (const apiPost of data.posts) {
      const postId = `dummy_${apiPost.id}`;
      
      if (!existingPostIds.has(postId)) {
        const originalUser = dummyUsers.find(u => u.originalId === apiPost.userId);
        
        await prisma.post.create({
          data: {
            id: postId,
            body: apiPost.body,
            userId: originalUser?.id || dummyUsers[0].id,
            createdAt: new Date(Date.now() - (newPostsCount * 1800000)),
            // Store original data as JSON in a custom field or use existing fields
            likedIds: Array(apiPost.reactions?.likes || 0).fill('dummy_like'),
          }
        });
        
        newPostsCount++;
      }
    }

    return NextResponse.json({ 
      message: `Synced dummy posts with original data`,
      newPosts: newPostsCount,
      totalExisting: existingPosts.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
