import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";

interface Item {
  id: string;
  content: string;
}

interface Section {
  title: string;
  items: Item[];
}

interface DroppableSectionProps {
  id: string;
  section: Section;
}

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2);
  return timestamp + randomStr;
}

function DraggableCard({
  id,
  children,
  isDraggedOver = false,
}: {
  id: string;
  children: React.ReactNode;
  isDraggedOver?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        type: "card",
        content: children,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    padding: "16px",
    margin: "8px",
    backgroundColor: isDragging ? "#4444ff" : "white",
    borderRadius: "8px",
    boxShadow: isDragging
      ? "0 5px 15px rgba(0,0,0,0.2)"
      : "0 2px 4px rgba(0,0,0,0.1)",
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    opacity: isDragging ? 0.5 : 1,
    transition: "box-shadow 0.2s, opacity 0.2s, background-color 0.2s",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function SupplySection({ items }: { items: Item[] }) {
  return (
    <div
      style={{
        width: "300px",
        backgroundColor: "#e0e0e0",
        padding: "16px",
        borderRadius: "8px",
      }}
    >
      <h2>Supplying Section</h2>
      {items.map((item) => (
        <DraggableCard key={item.id} id={item.id}>
          <div
            style={{
              backgroundColor: "#ff4444",
              padding: "20px",
              borderRadius: "4px",
              color: "white",
            }}
          >
            {item.content}
          </div>
        </DraggableCard>
      ))}
    </div>
  );
}

function SortableItem({ id, content }: { id: string; content: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id,
      data: {
        type: "section-item",
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    padding: "20px",
    margin: "8px",
    backgroundColor: "#4444ff",
    borderRadius: "4px",
    color: "white",
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0 : 1,
    boxShadow: isDragging
      ? "0 5px 15px rgba(0,0,0,0.2)"
      : "0 2px 4px rgba(0,0,0,0.1)",
    transition: isDragging
      ? undefined
      : "transform 0.2s, opacity 0.2s, box-shadow 0.2s",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </div>
  );
}

function DroppableSection({ id, section }: DroppableSectionProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  if (!section || !Array.isArray(section.items)) {
    console.error("Invalid section data:", { id, section });
    return null;
  }

  const showHoverState =
    isOver && active && active.data.current?.type === "card";

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
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </div>
  );
}

function DragItem({ content }: { content: string }) {
  return (
    <div
      style={{
        padding: "20px",
        margin: "8px",
        backgroundColor: "#4444ff",
        borderRadius: "4px",
        color: "white",
        width: "264px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      }}
    >
      {content}
    </div>
  );
}

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<string>("");

  const handleDragStart = (event: any) => {
    // Get the item that's starting to be dragged
    const { active } = event;

    // If nothing is being dragged, do nothing
    if (!active) return;

    // Remember which item is being dragged by saving its ID
    setActiveId(active.id);

    // If we're dragging an item that's already in a section (not from supply)
    if (active.data.current?.type === "section-item") {
      // Look through all sections
      Object.values(sections).forEach((section) => {
        // Try to find the item we're dragging
        const item = section.items.find((item) => item?.id === active.id);
        // If we found it, save its content
        if (item) {
          setActiveContent(item.content);
        }
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (active.data.current?.type === "card") {
      const sectionId = over.id.startsWith("section-")
        ? over.id.replace("section-", "")
        : findContainer(over.id);

      if (!sectionId || !sections[sectionId]) return;

      let insertIndex = sections[sectionId].items.length;
      if (!over.id.startsWith("section-")) {
        insertIndex = sections[sectionId].items.findIndex(
          (item) => item.id === over.id
        );
        if (insertIndex === -1) insertIndex = sections[sectionId].items.length;
      }

      // Create new item with a guaranteed unique ID
      const newItem = {
        id: generateId(),
        content: active.data.current.content.props.children,
      };

      setSections((prev) => {
        const cleanedItems = prev[sectionId].items.filter(
          (item) => !item.id.startsWith("temp-")
        );

        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            items: [
              ...cleanedItems.slice(0, insertIndex),
              newItem,
              ...cleanedItems.slice(insertIndex),
            ],
          },
        };
      });
    }
  };

  /**
   * Utility function to find which section contains a specific item
   * Returns the section ID (e.g., 'a', 'b', 'c') that contains the item
   */
  const findContainer = (id: string) => {
    return Object.keys(sections).find((key) =>
      sections[key].items.some((item) => item.id === id)
    );
  };

  const handleDragOver = (event: any) => {
    // Get the item being dragged (active) and what it's being dragged over (over)
    const { active, over } = event;
    if (!active || !over) return; // If either is missing, stop here

    const overId = over.id;

    // Figure out which section were hovering over
    // If were directly over a section (starts with "section-"), remove that prefix
    // Otherwise, find which section contains the item we're hovering over
    const overSectionId = over.id.startsWith("section-")
      ? over.id.replace("section-", "")
      : findContainer(over.id);

    if (!overSectionId) return; // If we can't find a valid section, stop here

    // PART 1: Handling items dragged from the supply section
    if (active.data.current?.type === "card") {
      setSections((prev) => {
        const overSection = prev[overSectionId]; // Get the target section

        // Find where in the list we should insert the item
        const overIndex = overSection.items.findIndex(
          (item) => item.id === overId
        );

        // If we found a specific position use it, otherwise add to the end
        const newIndex = overIndex >= 0 ? overIndex : overSection.items.length;

        // Create a temporary version of the dragged item
        const tempItem = {
          id: active.id,
          content: active.data.current.content.props.children,
        };

        // Make a copy of the items and insert the temp item at the right spot
        const newItems = [...overSection.items];
        newItems.splice(newIndex, 0, tempItem);

        // Return the updated sections with the new item in place
        return {
          ...prev,
          [overSectionId]: {
            ...overSection,
            items: newItems,
          },
        };
      });
    }
    // PART 2: Handling items dragged between sections
    else {
      // Find which section the dragged item came from
      const activeSectionId = findContainer(active.id);

      // If it's in the same section or we can't find the source, stop here
      if (!activeSectionId || activeSectionId === overSectionId) return;

      setSections((prev) => {
        // Get both the source and target sections
        const activeSection = prev[activeSectionId];
        const overSection = prev[overSectionId];

        // Find the positions in both lists
        const activeIndex = activeSection.items.findIndex(
          (item) => item.id === active.id
        );
        const overIndex = overSection.items.findIndex(
          (item) => item.id === overId
        );

        // Calculate where to put the item in the new section
        const newIndex =
          overIndex === -1 ? overSection.items.length : overIndex;

        // Return updated sections:
        // 1. Remove item from old section
        // 2. Add item to new section at the right position
        return {
          ...prev,
          [activeSectionId]: {
            ...activeSection,
            items: activeSection.items.filter((item) => item.id !== active.id),
          },
          [overSectionId]: {
            ...overSection,
            items: [
              ...overSection.items.slice(0, newIndex),
              activeSection.items[activeIndex],
              ...overSection.items.slice(newIndex),
            ],
          },
        };
      });
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver} // Real-time drag handling
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
          {activeId && activeContent && <DragItem content={activeContent} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
