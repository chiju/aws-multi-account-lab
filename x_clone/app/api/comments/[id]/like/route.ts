import { NextRequest } from 'next/server';
import { getAuthenticatedUserFromSession, handleApiRequest } from '@/lib/apiUtils';
import prisma from '@/lib/prismadb';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(async () => {
    const { id } = await params;
    const { user } = await getAuthenticatedUserFromSession();

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const likedIds = comment.likedIds || [];
    const isLiked = likedIds.includes(user.id);
    
    const updatedLikedIds = isLiked 
      ? likedIds.filter(id => id !== user.id)
      : [...likedIds, user.id];

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { likedIds: updatedLikedIds },
    });

    return {
      success: true,
      isLiked: !isLiked,
      likedIds: updatedComment.likedIds,
      likeCount: updatedComment.likedIds.length,
    };
  });
}
