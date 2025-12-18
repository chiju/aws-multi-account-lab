import UserProfile from "../page";

export default function ArticlesPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Articles" />;
}
