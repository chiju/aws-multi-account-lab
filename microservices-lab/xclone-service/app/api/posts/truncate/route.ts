import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';

export async function DELETE() {
  try {
    // Delete all comments first (due to foreign key constraints)
    await prisma.comment.deleteMany({});
    
    // Delete all posts
    await prisma.post.deleteMany({});
    
    // Delete dummy users (optional)
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@dummy.com'
        }
      }
    });

    return NextResponse.json({ 
      message: 'All posts and dummy users truncated successfully'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
