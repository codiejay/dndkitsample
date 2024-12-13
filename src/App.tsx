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

function DraggableCard({
  id,
  children,
  isDraggedOver = false,
  content,
}: {
  id: string;
  children: React.ReactNode;
  isDraggedOver?: boolean;
  content: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        type: "card",
        content: children,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        padding: "1rem",
        margin: "0.5rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        background: isDraggedOver ? "#e9ecef" : "white",
        cursor: "grab",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SupplySection({ items }: { items: Item[] }) {
  return (
    <div
      style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "8px" }}
    >
      <h2>Supplying Section</h2>
      {items.map((item) => (
        <DraggableCard key={item.id} id={item.id} content={item.content}>
          <div>{item.content}</div>
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
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: "1rem",
        margin: "1rem",
        background: "#f8f9fa",
        borderRadius: "8px",
        minHeight: "200px",
      }}
    >
      <h2>{section.title}</h2>
      <SortableContext
        items={section.items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.items.map((item) => (
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
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        background: "white",
        width: "200px",
      }}
    >
      {content}
    </div>
  );
}

export default function App() {
  const [supplyingItems, setSupplyingItems] = useState<Item[]>([
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
  const [activeContent, setActiveContent] = useState<string | null>(null);

  /**
   * Utility function to find which section contains a specific item
   * Returns the section ID (e.g., 'a', 'b', 'c') that contains the item
   */
  const findContainer = (id: string) => {
    return Object.keys(sections).find((key) =>
      sections[key].items.some((item) => item.id === id)
    );
  };

  const handleDragStart = (event: any) => {
    console.log(event, "<- Drag start");
    const { active } = event;
    if (!active) return;
    setActiveId(active.id);

    // If we're dragging from a section
    if (active.data.current?.type === "section-item") {
      // Find the item in any section
      Object.values(sections).forEach((section) => {
        const item = section.items.find((item) => item?.id === active.id);
        if (item) {
          console.log(active.content);
          setActiveContent(item.content);
        }
      });
    }
    // If we're dragging from supply
    else if (active.data.current?.type === "card") {
      console.log(active.data, "<- Drag start");
      setActiveContent(active.data.current.content.props.children);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    const overSectionId = over.id.startsWith("section-")
      ? over.id.replace("section-", "")
      : findContainer(over.id);

    if (!overSectionId) {
      setActiveId(null);
      return;
    }

    // If dropping from supply section
    if (active.data.current?.type === "card") {
      setSections((prev) => {
        const overSection = prev[overSectionId];
        const overIndex = overSection.items.findIndex(
          (item) => item.id === overId
        );
        const newIndex = overIndex >= 0 ? overIndex : overSection.items.length;

        // Create a new unique ID for the dropped item
        const uniqueId = `supply-${active.id}-${Date.now()}`;
        const draggedItem = {
          id: uniqueId, // Use the unique ID here
          content: active.data.current.content.props.children,
        };

        // Filter out any temporary items before adding the final item
        const filteredItems = overSection.items.filter(
          (item) => !item.id.includes(active.id)
        );

        return {
          ...prev,
          [overSectionId]: {
            ...overSection,
            items: [
              ...filteredItems.slice(0, newIndex),
              draggedItem,
              ...filteredItems.slice(newIndex),
            ],
          },
        };
      });
    }

    setActiveId(null);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;

    const overId = over.id;
    const overSectionId = over.id.startsWith("section-")
      ? over.id.replace("section-", "")
      : findContainer(over.id);

    if (!overSectionId) return;

    setSections((prev) => {
      const overSection = prev[overSectionId];
      const overIndex = overSection.items.findIndex(
        (item) => item.id === overId
      );

      // Calculate where to put the item
      const newIndex = overIndex >= 0 ? overIndex : overSection.items.length;

      // If dragging from supply section
      if (active.data.current?.type === "card") {
        const tempItem = {
          id: active.id,
          content: active.data.current.content.props.children,
        };

        // Remove any existing temp items first
        const filteredItems = overSection.items.filter(
          (item) => !item.id.includes(active.id)
        );

        return {
          ...prev,
          [overSectionId]: {
            ...overSection,
            items: [
              ...filteredItems.slice(0, newIndex),
              tempItem,
              ...filteredItems.slice(newIndex),
            ],
          },
        };
      }

      // If dragging between sections
      const activeSectionId = findContainer(active.id);
      if (activeSectionId && activeSectionId !== overSectionId) {
        const activeSection = prev[activeSectionId];
        const activeIndex = activeSection.items.findIndex(
          (item) => item.id === active.id
        );
        const draggedItem = activeSection.items[activeIndex];

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
              draggedItem,
              ...overSection.items.slice(newIndex),
            ],
          },
        };
      }

      return prev;
    });
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
        <SupplySection items={supplyingItems} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {Object.entries(sections).map(([key, section]) => (
            <DroppableSection
              key={key}
              id={`section-${key}`}
              section={section}
            />
          ))}
        </div>
      </div>
      <div>
        {createPortal(
          <DragOverlay>
            {activeId && <DragItem content={activeContent?.toString() || ""} />}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  );
}
