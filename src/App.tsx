import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { createPortal } from "react-dom";
import { DroppableSection } from "./components/DroppableSection";
import { SortableItem } from "./components/SortableItem";
import { SupplySection } from "./components/SupplySection";
import { useDragHandlers } from "./hooks/useDragHandlers";
import { Item, Section } from "./types";

export default function App() {
  const [supplyingItems] = useState<Item[]>([
    { id: "1", content: "Item 1" },
    { id: "2", content: "Item 2" },
    { id: "3", content: "Item 3" },
    { id: "4", content: "Item 4" },
    { id: "5", content: "Item 5" },
  ]);

  const [sections, setSections] = useState<Record<string, Section>>({
    a: { title: "Section A", items: [] },
    b: { title: "Section B", items: [] },
    c: { title: "Section C", items: [] },
  });

  const {
    activeId,
    activeContent,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDragHandlers();

  return (
    <DndContext
      onDragStart={(e) => handleDragStart(e, sections)}
      onDragEnd={(e) => handleDragEnd(e, sections, setSections)}
      onDragOver={(e) => handleDragOver(e, sections, setSections)}
    >
      <div style={{ display: "flex", gap: "24px", padding: "20px" }}>
        <SupplySection items={supplyingItems} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(sections).map(([key, section]) => (
            <DroppableSection
              key={`section-${key}`}
              id={`section-${key}`}
              section={section}
            />
          ))}
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeId && activeContent && (
            <div style={{ opacity: 0.4 }}>
              <SortableItem
                id={activeId}
                content={activeContent}
                showHoverState={false}
              />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
