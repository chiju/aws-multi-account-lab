import UserProfile from "../page";

export default function MediaPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Media" />;
}
