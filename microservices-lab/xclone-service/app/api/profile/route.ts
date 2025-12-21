import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';
import { getAuthenticatedUser } from '@/lib/authUtils';

export async function PUT(request: Request) {
  try {
    const session = await getAuthenticatedUser();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const { name, bio, profileImage, coverImage } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name,
        bio,
        image: profileImage,
        coverImage
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await getAuthenticatedUser();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        name: true,
        bio: true,
        image: true,
        coverImage: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
