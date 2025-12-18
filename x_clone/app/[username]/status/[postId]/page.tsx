import Link from "next/link";
import prisma from "@/lib/prismadb";
import Post from "@/components/feed/Post";
import Comments from "@/components/Comments";

interface PostPageProps {
  params: Promise<{
    username: string;
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  
  let post;
  
  try {
    // Fetch post from database - handle both regular and dummy post IDs
    if (postId.startsWith('dummy_')) {
      // For dummy posts, search by body content since ID format is incompatible
      const dummyId = postId.replace('dummy_', '');
      post = await prisma.post.findFirst({
        where: {
          user: {
            email: {
              contains: '@dummy.com'
            }
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
    } else {
      // Regular post lookup
      post = await prisma.post.findUnique({
        where: { id: postId },
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
      });
    }
  } catch (error) {
    console.error('Failed to fetch post:', error);
  }

  if (!post) {
    return (
      <div className="p-1">
        <div className="flex items-center gap-8 mb-2">
          <Link href="/">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white hover:bg-neutral-800 rounded-full p-1">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="font-bold text-lg">Post</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-neutral-500">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-black/80">
        <Link href="/">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white hover:bg-neutral-800 rounded-full p-1">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="font-bold text-lg">Post</h1>
      </div>
      
      <div className="border-b border-neutral-800">
        <Post post={post} />
      </div>
      
      <Comments 
        postId={post.id} 
        comments={post.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }))} 
        postOwnerUsername={post.user.username}
      />
    </div>
  );
}
