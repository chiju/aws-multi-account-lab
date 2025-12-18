interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
  followingIds?: string[];
  followerIds?: string[];
}

export const fetchUserByUsername = async (username: string) => {
  const response = await fetch(`/api/users?username=${username}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (!userIds.length) return [];
  const allUsers = await fetchAllUsers();
  return allUsers.filter((user) => userIds.includes(user.id));
};
