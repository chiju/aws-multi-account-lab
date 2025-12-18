import UserProfile from "../page";

export default function RepliesPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Replies" />;
}
