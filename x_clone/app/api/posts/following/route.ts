import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { getAuthenticatedUser } from '@/lib/authUtils';

export async function GET() {
  try {
    const session = await getAuthenticatedUser();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get current user with their following list
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get posts from followed users with same structure as main posts API
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: currentUser.followingIds
        }
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
        comments: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching following posts:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
