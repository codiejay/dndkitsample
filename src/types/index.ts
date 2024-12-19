interface Item {
  id: string;
  content: string;
}

interface Section {
  title: string;
  items: { id: string }[];
}

interface DroppableSectionProps {
  id: string;
  section: Section;
}

export type { DroppableSectionProps, Item, Section };
