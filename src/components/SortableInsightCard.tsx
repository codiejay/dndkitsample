import { InsightCard } from "../InsightCards";

type SortableInsightCardProps = {
  id: string;
  content: string;
};

export function SortableInsightCard({ id, content }: SortableInsightCardProps) {
  return (
    <InsightCard key={id} id={id}>
      <h3>{content}</h3>
      <p>Drag to reorder!</p>
    </InsightCard>
  );
}
