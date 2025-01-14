import { DndContext, DragOverlay, Modifier, useDroppable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DroppableSectionProps, Item, Section } from "./types";

import { useDraggable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 } from "uuid";
import { CSS } from "@dnd-kit/utilities";
import "./styles.css";

const AS_INDICATOR = false;

interface DraggableCardProps {
  item: { stableId: string; id: string; content: string };
}

function DraggableCard({ item }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
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
      {item.content}
    </div>
  );
}

const SortableItem = ({ item }: { item: Item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: item.id,
    data: {
      entityType: "item",
      stableId: item.id,
      content: item.content,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  let className = "draggable-item";
  if (AS_INDICATOR && isDragging) {
    className += " indicator";
  } else if (isDragging) {
    className += " dragging";
  }

  let content: string | null = item.content;
  if (AS_INDICATOR && isDragging) {
    content = null;
  }

  return (
    <div
      {...attributes}
      {...listeners}
      className={className}
      ref={setNodeRef}
      style={style}
    >
      {content}
    </div>
  );
};

const DroppableSection = ({ section }: DroppableSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
    data: {
      entityType: "section",
      sectionId: section.id,
    },
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
        id={section.id}
        items={section.items}
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
  const [activeCard, setActiveCard] = useState<
    | {
        stableId: string;
        id: string;
        content: string;
        inSection: string | null;
      }
    | undefined
  >(undefined);
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
      id: string;
      title: string;
      items: { id: string; content: string }[];
    }[]
  >([
    { id: "z238gfdbd", title: "a", items: [{ id: "6", content: "Item 6" }] },
    {
      id: "vas4g3ev",
      title: "b",
      items: [
        { id: "7", content: "Item 7" },
        { id: "8", content: "Item 8" },
        { id: "9", content: "Item 9" },
      ],
    },
    {
      id: "f34y32eg",
      title: "c",
      items: [
        { id: "10", content: "Item 10" },
        { id: "11", content: "Item 11" },
      ],
    },
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

  return (
    <DndContext
      onDragStart={(e) => {
        // console.log("App onDragStart :>> ", e);
        const { active } = e;
        if (!active.data.current) return;
        setActiveCard({
          stableId: active.data.current.stableId,
          id: active.id as string,
          content: active.data.current.content,
          inSection: active.data.current.sortable?.containerId ?? null,
        });
      }}
      onDragEnd={(e) => {
        // the only thing we need to do here is to save the reordering of the items
        // in the section;
        console.log("App onDragEnd :>> ", e);
        const { active, over } = e;
        if (!active || !over) return;
        if (over.data.current?.entityType === "section") return;

        const previousIndex = active.data.current?.sortable?.index;
        const newIndex = over?.data.current?.sortable?.index;
        if (previousIndex === newIndex) return;

        // we need to update the sections with the new order of the items
        // (new order is items up to the new index, then the active card,
        // then the items after the new index); and we need to remove the
        // active card from its previous place in the sequence
        const newSections = sections.map((section) => {
          if (section.id === active.data.current?.sortable?.containerId) {
            const oldIndex = section.items.findIndex(
              (item) => item.id === active.id
            );
            const newIndex = section.items.findIndex(
              (item) => item.id === over.id
            );

            const newItems = Array.from(section.items);
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return {
              ...section,
              items: newItems,
            };
          }
          return section;
        });

        setSections(newSections);
      }}
      onDragOver={(e) => {
        const { active, over } = e;

        // When not dragging over anything, we should remove the active card
        // if it was added to a section before; this ensures that the user
        // can drop the card outside to remove it from the section
        if (!over) {
          if (activeCard?.inSection) {
            setSections((prevSections) => {
              return prevSections.map((section) => {
                if (section.id === activeCard.inSection) {
                  return {
                    ...section,
                    items: section.items.filter(
                      (item) => item.id !== activeCard.id
                    ),
                  };
                }
                return section;
              });
            });
          }
          return;
        }

        if (!active || !activeCard) return;

        if (over.data.current?.entityType === "item") {
          // nothing to do here, we are just dragging over an item;
          // this is because we are using the SortableContext to sort the items,
          // it will automatically handle the visual feedback of the sorting of the items
          return;
        } else if (over.data.current?.entityType === "section") {
          // when dragging over a section, we will add the card to the end of the section;
          // however, we need to make sure the card is not already in the section
          const sectionId = over.data.current?.sectionId;

          // check if the card is already in the section, if so, do nothing
          const section = sections.find((section) => section.id === sectionId);
          if (!section) return;
          const isCardInSection = section.items.some(
            (item) => item.id === activeCard.id
          );
          if (isCardInSection) return;

          // if the card is not in the section, add it to the end of the section;
          // however, if the card was in another section before, we need to remove
          // it from the other section
          setSections((prevSections) => {
            const prevSectionId = activeCard.inSection;
            let indexToRemove = -1;
            if (prevSectionId) {
              indexToRemove = prevSections.findIndex(
                (section) => section.id === prevSectionId
              );
            }
            return prevSections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  items: [
                    ...section.items,
                    { id: activeCard.id, content: activeCard.content },
                  ],
                };
              }
              // if the card was in another section before, we need to remove it from the other section
              if (indexToRemove !== -1) {
                prevSections[indexToRemove].items = prevSections[
                  indexToRemove
                ].items.filter((item) => item.id !== activeCard.id);
              }
              return section;
            });
          });

          // after adding the card to the section, we need to update the active card
          // to indicate that it was added to the section; this is needed to be able to
          // remove the card from the section when it is dropped outside of the section
          setActiveCard((prevCard) => {
            if (!prevCard) return undefined;
            return {
              stableId: prevCard.stableId,
              id: prevCard.id,
              content: prevCard.content,
              inSection: sectionId,
            };
          });
        }
      }}
    >
      <div style={{ display: "flex", gap: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {supplyingItems.map((item) => (
            <DraggableCard key={item.id} item={item} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((section) => (
            <DroppableSection key={section.id} section={section} />
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
