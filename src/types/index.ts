interface Item {
  id: string;
  content: string;
}

interface Section {
  id: string;
  title: string;
  items: Item[];
}

interface DroppableSectionProps {
  section: Section;
}

export type { DroppableSectionProps, Item, Section };
