import { getAuthenticatedUserFromSession, handleApiRequest } from '@/lib/apiUtils';

export async function GET() {
  return handleApiRequest(async () => {
    const { user } = await getAuthenticatedUserFromSession();
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image
    };
  });
}
