import UserProfile from "../page";

export default function HighlightsPage({ params }: { params: Promise<{ username: string }> }) {
  return <UserProfile params={params} activeTab="Highlights" />;
}
