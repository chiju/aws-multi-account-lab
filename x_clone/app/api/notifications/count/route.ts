import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/authUtils";
import prisma from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedUser();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get lastSeen timestamp from query params
    const { searchParams } = new URL(request.url);
    const lastSeen = searchParams.get('lastSeen');
    
    const whereClause = lastSeen 
      ? { 
          userId: currentUser.id,
          createdAt: { gt: new Date(parseInt(lastSeen)) }
        }
      : { userId: currentUser.id };

    const count = await prisma.notification.count({
      where: whereClause
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ count: 0 });
  }
}
