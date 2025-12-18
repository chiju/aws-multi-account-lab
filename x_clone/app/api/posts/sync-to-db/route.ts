import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST() {
  try {
    // Fetch from external API directly
    const postsResponse = await fetch('https://dummyjson.com/posts');
    const postsData = await postsResponse.json();
    
    let syncedCount = 0;
    
    for (const apiPost of postsData.posts.slice(0, 10)) { // Limit to first 10 posts
      // Check if post already exists by body content
      const existingPost = await prisma.post.findFirst({
        where: { body: apiPost.body }
      });
      
      if (!existingPost) {
        // Create simple user
        const dbUser = await prisma.user.upsert({
          where: { email: `user${apiPost.userId}@dummy.com` },
          update: {},
          create: {
            email: `user${apiPost.userId}@dummy.com`,
            name: `User ${apiPost.userId}`,
            username: `user${apiPost.userId}`,
            bio: 'Dummy user',
          }
        });
        
        // Create post with original like count (store as empty array, we'll show count in UI)
        await prisma.post.create({
          data: {
            body: apiPost.body,
            userId: dbUser.id,
            createdAt: new Date(Date.now() - (apiPost.id * 3600000)),
            likedIds: [], // Empty for now, we'll handle likes in UI
          }
        });
        
        syncedCount++;
      }
    }
    
    return NextResponse.json({ 
      message: `Synced ${syncedCount} posts to database with exact details`,
      synced: syncedCount
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
