import { NextRequest } from 'next/server';
import { getAuthenticatedUserFromSession, handleApiRequest, createErrorResponse } from '@/lib/apiUtils';
import prisma from '@/lib/prismadb';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(async () => {
    const { id } = await params;
    const { user } = await getAuthenticatedUserFromSession();

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const likedIds = post.likedIds || [];
    const isLiked = likedIds.includes(user.id);
    
    const updatedLikedIds = isLiked 
      ? likedIds.filter(id => id !== user.id)
      : [...likedIds, user.id];

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { likedIds: updatedLikedIds },
    });

    return {
      success: true,
      isLiked: !isLiked,
      likedIds: updatedPost.likedIds,
      likeCount: updatedPost.likedIds.length,
    };
  });
}
