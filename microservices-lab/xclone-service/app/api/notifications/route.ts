import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/authUtils";
import prisma from "@/lib/prismadb";

export async function GET() {
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

    console.log('Fetching notifications for user:', currentUser.id);
    const notifications = await prisma.notification.findMany({
      where: { userId: currentUser.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Found notifications:', notifications.length);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
