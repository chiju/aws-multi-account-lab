import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  
  return session;
};

export const createUnauthorizedResponse = () => {
  return new NextResponse("Unauthorized", { status: 401 });
};
