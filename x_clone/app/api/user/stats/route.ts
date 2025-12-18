import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse("Email required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        followingIds: true
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Count followers (users who have this user's ID in their followingIds)
    const followersCount = await prisma.user.count({
      where: {
        followingIds: {
          has: user.id
        }
      }
    });

    return NextResponse.json({
      following: user.followingIds.length,
      followers: followersCount
    });
  } catch (error) {
    return handleApiError(error);
  }
}
