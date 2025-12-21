import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';
import { getAuthenticatedUser } from '@/lib/authUtils';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
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
        createdAt: 'desc', // Latest posts first
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedUser();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { body } = await request.json();

    if (!body) {
      return new NextResponse("Body is required", { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        body,
        userId: currentUser.id,
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

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post || post.userId !== currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
