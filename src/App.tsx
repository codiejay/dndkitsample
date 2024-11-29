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
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        type: "card",
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    padding: "16px",
    margin: "8px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: isDragging
      ? "0 5px 15px rgba(0,0,0,0.2)"
      : "0 2px 4px rgba(0,0,0,0.1)",
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    opacity: isDragging ? 0.5 : 1,
    transition: "box-shadow 0.2s, opacity 0.2s",
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
    const { active } = event;

    if (!active) return;

    setActiveId(active.id);

    if (active.data.current?.type === "section-item") {
      Object.values(sections).forEach((section) => {
        const item = section.items.find((item) => item?.id === active.id);
        if (item) {
          setActiveContent(item.content);
        }
      });
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    setActiveContent("");

    const { active, over } = event;

    if (!active || !over) return;

    if (active.data.current?.type === "card") {
      const sectionId = over.id.replace("section-", "");
      const item = supplyingItems.find((item) => item?.id === active.id);

      if (item && sections[sectionId]) {
        const newItem = { ...item, id: generateId() };
        setSections((prevSections) => ({
          ...prevSections,
          [sectionId]: {
            ...prevSections[sectionId],
            items: [...prevSections[sectionId].items, newItem],
          },
        }));
      }
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    let sourceSectionId = "";
    let destinationSectionId = "";
    let sourceIndex = -1;
    let destinationIndex = -1;

    Object.entries(sections).forEach(([sectionId, section]) => {
      if (!section || !Array.isArray(section.items)) return;

      const sIndex = section.items.findIndex((item) => item?.id === activeId);
      const dIndex = section.items.findIndex((item) => item?.id === overId);

      if (sIndex !== -1) {
        sourceSectionId = sectionId;
        sourceIndex = sIndex;
      }
      if (dIndex !== -1) {
        destinationSectionId = sectionId;
        destinationIndex = dIndex;
      }
    });

    if (over.id.startsWith("section-")) {
      destinationSectionId = over.id.replace("section-", "");
      destinationIndex = sections[destinationSectionId]?.items?.length || 0;
    }

    if (!sourceSectionId || sourceIndex === -1) return;

    setSections((prevSections) => {
      const newSections = { ...prevSections };
      const sourceItems = [...(newSections[sourceSectionId]?.items || [])];
      const [movedItem] = sourceItems.splice(sourceIndex, 1);

      if (!movedItem) return prevSections;

      if (sourceSectionId === destinationSectionId) {
        sourceItems.splice(destinationIndex, 0, movedItem);
        newSections[sourceSectionId] = {
          ...newSections[sourceSectionId],
          items: sourceItems,
        };
      } else {
        newSections[sourceSectionId] = {
          ...newSections[sourceSectionId],
          items: sourceItems,
        };

        if (newSections[destinationSectionId]) {
          newSections[destinationSectionId] = {
            ...newSections[destinationSectionId],
            items: [
              ...newSections[destinationSectionId].items.slice(
                0,
                destinationIndex
              ),
              movedItem,
              ...newSections[destinationSectionId].items.slice(
                destinationIndex
              ),
            ],
          };
        }
      }

      return newSections;
    });
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

  /**
   * Real-time drag handling - This is the core of the smooth animation
   * Triggered continuously as items are dragged over different positions
   *
   * This function:
   * 1. Removes item from its original section
   * 2. Inserts it into the new section
   * 3. Updates the UI before the actual drop occurs
   */
  const handleDragOver = (event: any) => {
    console.log("handleDragOver", event);
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id;
    const overId = over.id;

    // TODAY Make cards from supplyingItems "blue" with unique ID
    // So can go into existing sections.

    // Handle two types of "over" scenarios:
    // 1. Over a section (section-a, section-b, etc.)
    // 2. Over an item within a section
    const overSectionId = over.id.startsWith("section-")
      ? over.id.replace("section-", "")
      : findContainer(over.id);

    const activeSectionId = findContainer(activeId);

    // Don't do anything if we're dragging within the same section
    if (!activeSectionId || !overSectionId || activeSectionId === overSectionId)
      return;

    setSections((prev) => {
      const activeSection = prev[activeSectionId];
      const overSection = prev[overSectionId];

      // Calculate the precise insertion point for the dragged item
      const overIndex = overSection.items.findIndex(
        (item) => item.id === overId
      );
      const activeIndex = activeSection.items.findIndex(
        (item) => item.id === activeId
      );

      // If not over a specific item, append to the end
      const newIndex = overIndex === -1 ? overSection.items.length : overIndex;
      // const newIndex = overSection.items.length;

      console.log("activeID", activeId);
      console.log("overID", overId);
      console.log("activeIndex", activeIndex);
      console.log("overIndex", overIndex);
      console.log("newIndex", newIndex);
      console.log("activeSectionID", activeSectionId);
      console.log("overSectionID", overSectionId);
      console.log("overSectionItems", overSection.items);
      // Create new state with the item moved to its new position
      return {
        ...prev,
        [activeSectionId]: {
          ...activeSection,
          // Remove item from original section
          items: activeSection.items.filter((item) => item.id !== activeId),
        },
        [overSectionId]: {
          ...overSection,
          // Insert item at the exact hover position
          items: [
            ...overSection.items.slice(0, newIndex),
            activeSection.items[activeIndex],
            ...overSection.items.slice(newIndex),
          ],
        },
      };
    });
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
