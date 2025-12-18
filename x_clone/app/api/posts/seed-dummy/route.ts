import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';

export async function POST() {
  try {
    // Fetch dummy posts from external API
    const response = await fetch('https://dummyjson.com/posts');
    const data = await response.json();
    
    // Create dummy users first
    const dummyUsers = [];
    for (let i = 1; i <= 10; i++) {
      const user = await prisma.user.upsert({
        where: { email: `user${i}@dummy.com` },
        update: {},
        create: {
          email: `user${i}@dummy.com`,
          name: `User ${i}`,
          username: `user${i}`,
          bio: `This is dummy user ${i}`,
        }
      });
      dummyUsers.push(user);
    }

    // Create posts for dummy users
    const createdPosts = [];
    for (let i = 0; i < Math.min(data.posts.length, 20); i++) {
      const post = data.posts[i];
      const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      
      const createdPost = await prisma.post.create({
        data: {
          body: post.body,
          userId: randomUser.id,
          createdAt: new Date(Date.now() - (i * 3600000)), // Each post 1 hour older
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
      
      createdPosts.push(createdPost);
    }

    return NextResponse.json({ 
      message: `Created ${createdPosts.length} dummy posts and ${dummyUsers.length} dummy users`,
      posts: createdPosts.length,
      users: dummyUsers.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
