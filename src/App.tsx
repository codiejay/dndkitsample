import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DroppableSectionProps, Item, Section } from "./types";

import { useDraggable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 } from "uuid";
import "./styles.css";
interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  item: { stableId: string; id: string; content: string };
}

function DraggableCard({ id, children, item }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      stableId: item.stableId,
      content: item.content,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`draggable-item ${isDragging ? "dragging" : ""}`}
    >
      {children}
    </div>
  );
}

const SortableItem = ({ item }: { item: Item }) => {
  const { attributes, listeners, setNodeRef, isDragging, isOver } = useSortable(
    {
      id: item.id,
      data: {
        stableId: item.id,
        content: item.content,
      },
    }
  );

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`draggable-item ${isDragging ? "dragging" : ""} ${
        isOver ? "over" : ""
      }`}
    >
      {item.content}
    </div>
  );
};

const DroppableSection = ({ id, section }: DroppableSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      className={`droppable-section ${isOver ? "over" : ""}`}
    >
      <div>
        <h2>{section.title}</h2>
      </div>
      <SortableContext
        items={section.items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.items.map((item) => (
          <SortableItem key={item.id} item={item} />
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
  const [activeCard, setActiveCard] = useState<{
    stableId: string;
    id: string;
    content: string;
  } | null>(null);
  // const [overItemId, setOverItemId] = useState<string | null>(null);
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
  }, [activeCard]);

  console.log("activeCard", activeCard);

  return (
    <DndContext
      onDragStart={(e) => {
        console.log("App onDragStart :>> ", e);
        if (!e.active.data.current) return;
        setActiveCard({
          stableId: e.active.data.current.stableId,
          id: e.active.id as string,
          content: e.active.data.current.content,
        });
      }}
      onDragOver={(e) => {
        console.log("App onDragOver :>> ", e);
      }}
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
          {activeCard && <SortableItem item={activeCard} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
