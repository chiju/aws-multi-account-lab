import UserProfile from "../page";

export default function LikesPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Likes" />;
}
