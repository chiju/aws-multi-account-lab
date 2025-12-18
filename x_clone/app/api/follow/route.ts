import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';
import { getAuthenticatedUser } from '@/lib/authUtils';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedUser();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { followingId } = await request.json();

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if already following
    const isFollowing = (currentUser.followingIds || []).includes(followingId);

    if (isFollowing) {
      // Unfollow - remove from followingIds array
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          followingIds: {
            set: (currentUser.followingIds || []).filter(id => id !== followingId)
          }
        }
      });

      // Remove follow notification
      await prisma.notification.deleteMany({
        where: {
          userId: followingId,
          body: {
            contains: `You got a new follower @${currentUser.username || currentUser.name}`
          }
        }
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow - add to followingIds array
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          followingIds: {
            set: [...(currentUser.followingIds || []), followingId]
          }
        }
      });

      // Create follow notification
      console.log('Creating notification for user:', followingId, 'from:', currentUser.id);
      const currentDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
      const notification = await prisma.notification.create({
        data: {
          userId: followingId,
          body: `You got a new follower @${currentUser.username || currentUser.name} on ${currentDate}`
        }
      });
      console.log('Notification created:', notification);

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
