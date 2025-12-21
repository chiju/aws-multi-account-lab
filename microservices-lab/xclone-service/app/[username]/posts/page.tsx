import UserProfile from "../page";

export default function PostsPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Posts" />;
}
