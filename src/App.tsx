import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDragHandlers } from "./hooks/useDragHandlers";
import { DroppableSectionProps, Item, Section } from "./types";

import { useDraggable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 } from "uuid";
interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  item: { stableId: string; id: string; content: string };
}

function DraggableCard({ id, children, item }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: {
      stableId: item.stableId,
    },
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const SortableItem = ({
  id,
  children,
}: {
  id: string | number;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const DroppableSection = ({ id, section }: DroppableSectionProps) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{}}>
      <div>
        <h2>{section.title}</h2>
      </div>
      <SortableContext
        items={section.items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            <div>{item.id}</div>
          </SortableItem>
        ))}
      </SortableContext>
    </div>
  );
};

const supplyData = [
  { id: "1", content: "Item 1" },
  { id: "2", content: "Item 2" },
  { id: "3", content: "Item 3" },
  { id: "4", content: "Item 4" },
  { id: "5", content: "Item 5" },
];

export default function App() {
  const [activeId, setActiveId] = useState<number | string | null>(null);
  const [activeStableId, setActiveStableId] = useState<string | null>(null);
  const [supplyingItems, setSupplyingItems] = useState<
    { stableId: string; id: string; content: string }[]
  >(
    supplyData.map((item) => ({
      stableId: item.id,
      id: `${item.id}-${v4()}`,
      content: item.content,
    }))
  );

  const [sections, setSections] = useState<
    {
      title: string;
      items: { id: string; content: string }[];
    }[]
  >([
    { title: "a", items: [{ id: "6", content: "Item 6" }] },
    {
      title: "b",
      items: [
        { id: "7", content: "Item 7" },
        { id: "8", content: "Item 8" },
      ],
    },
    { title: "c", items: [] },
  ]);

  useEffect(() => {
    setSupplyingItems(
      supplyData.map((item) => ({
        stableId: item.id,
        id: `${item.id}-${v4()}`,
        content: item.content,
      }))
    );
  }, [activeId]);

  console.log("activeId", activeId);
  console.log("activeStableId", activeStableId);

  return (
    <DndContext
      onDragStart={(e) => {
        console.log("onDragStart", e);
        setActiveId(e.active.id);
        setActiveStableId(e.active.data.current?.stableId);
      }}
      // onDragEnd={(e) => handleDragEnd(e, sections, setSections)}
      onDragOver={(e) => console.log("onDragOver", e)}
    >
      <div style={{ display: "flex", gap: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {supplyingItems.map((item) => (
            <DraggableCard key={item.id} id={item.id} item={item}>
              <div>{item.content}</div>
            </DraggableCard>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((section) => (
            <DroppableSection
              key={`${section.title}`}
              id={`${section.title}`}
              section={section}
            />
          ))}
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeId && (
            <SortableItem id={activeId}>
              <div>
                {supplyData.find((item) => item.id === activeStableId)?.content}
              </div>
            </SortableItem>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
