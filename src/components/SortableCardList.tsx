import { SortableInsightCard } from "./SortableInsightCard";

type CardItem = {
  id: string;
  content: string;
};

type SortableCardListProps = {
  items: CardItem[];
  className?: string;
  style?: React.CSSProperties;
};

export function SortableCardList({
  items,
  className,
  style,
}: SortableCardListProps) {
  return (
    <div className={className} style={style}>
      {items.map((item) => (
        <SortableInsightCard key={item.id} {...item} />
      ))}
    </div>
  );
}
