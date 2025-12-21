import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET() {
  try {
    // Find duplicate posts by body content
    const duplicates = await prisma.post.groupBy({
      by: ['body'],
      _count: {
        body: true,
      },
      having: {
        body: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    // Get the actual duplicate posts
    const duplicateDetails = [];
    for (const duplicate of duplicates) {
      const posts = await prisma.post.findMany({
        where: { body: duplicate.body },
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      });
      duplicateDetails.push({
        body: duplicate.body,
        count: duplicate._count.body,
        posts: posts,
      });
    }

    return NextResponse.json({
      duplicateCount: duplicates.length,
      duplicates: duplicateDetails,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
