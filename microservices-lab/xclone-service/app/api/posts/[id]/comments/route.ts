import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Comments API called with postId:', id);
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('No session found');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { body } = await request.json();
    console.log('Comment body:', body);
    
    const postId = id;

    if (!body) {
      console.log('No body provided');
      return new NextResponse("Body is required", { status: 400 });
    }

    console.log('Finding user with email:', session.user.email);
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('Current user found:', currentUser?.id);

    if (!currentUser) {
      console.log('User not found in database');
      return new NextResponse("User not found", { status: 404 });
    }

    console.log('Creating comment...');
    const comment = await prisma.comment.create({
      data: {
        body,
        userId: currentUser.id,
        postId: postId,
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
    console.log('Comment created:', comment.id);

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('Comment creation error:', error);
    console.error('Error stack:', error.stack);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
