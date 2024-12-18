import { verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Item } from "../types";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { DroppableSectionProps } from "../types";
import { SortableItem } from "./SortableItem";

export const DroppableSection = ({ id, section }: DroppableSectionProps) => {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  if (!section || !Array.isArray(section.items)) {
    console.error("Invalid section data:", { id, section });
    return null;
  }

  const showHoverState = isOver;

  const validItems = section.items.filter(
    (item): item is Item =>
      item !== null && item !== undefined && typeof item.id === "string"
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "300px",
        backgroundColor: showHoverState ? "#c0c0c0" : "#e0e0e0",
        padding: "16px",
        borderRadius: "8px",
        border: showHoverState ? "2px dashed #666" : "2px solid transparent",
        transition: "background-color 0.2s, border 0.2s",
      }}
    >
      <h2>{section.title}</h2>
      <SortableContext
        items={validItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {validItems.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            content={item.content}
            showHoverState={showHoverState || false}
          />
        ))}
      </SortableContext>
    </div>
  );
};
