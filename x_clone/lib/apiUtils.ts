import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function getAuthenticatedUserFromSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return { session, user };
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any) {
  return NextResponse.json({ success: true, ...data });
}

export async function handleApiRequest<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Authentication required', 401);
    }
    
    if (error.message === 'User not found') {
      return createErrorResponse('User not found', 404);
    }
    
    return createErrorResponse('Internal server error', 500);
  }
}
