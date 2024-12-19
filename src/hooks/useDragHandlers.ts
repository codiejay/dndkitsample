import { useState } from "react";
import { Section } from "../types";
import { findContainer, generateId } from "../utils/helpers";
import { Active, Over } from "@dnd-kit/core";

export function useDragHandlers() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<string>("");

  const handleDragStart = (event: any, sections: Record<string, Section>) => {
    console.log("handleDragStart");
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

  const handleDragEnd = (
    event: any,
    sections: Record<string, Section>,
    setSections: React.Dispatch<React.SetStateAction<Record<string, Section>>>
  ) => {
    if (!event?.active?.data || !event?.over) {
      setActiveId(null);
      setActiveContent("");
      return;
    }

    const { active, over } = event;

    if (!active.data.current) {
      setActiveId(null);
      return;
    }

    if (active.data.current?.type === "card") {
      handleSupplyDragEnd(active, over, sections, setSections);
    }

    if (active.data.current?.type === "section-item") {
      handleSectionDragEnd(active, over, sections, setSections);
    }

    setActiveId(null);
    setActiveContent("");
  };

  const handleDragOver = (
    event: any,
    sections: Record<string, Section>,
    setSections: React.Dispatch<React.SetStateAction<Record<string, Section>>>
  ) => {
    const { active, over } = event;
    if (!active || !over) return;

    const overId = over.id;
    const overSectionId = over.id.startsWith("section-")
      ? over.id.replace("section-", "")
      : findContainer(sections, over.id);

    // if (!overSectionId) return;

    if (
      active.data.current?.type === "section-item" ||
      active.data.current?.type === "card"
    ) {
      handleSectionDragOver(active, over, overSectionId, sections, setSections);
    }
  };

  return {
    activeId,
    activeContent,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
}

function handleSectionDragEnd(
  active: any,
  over: any,
  sections: Record<string, Section>,
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section>>>
) {
  const sectionId = findContainer(sections, over.id);
  if (!sectionId || !sections[sectionId]) return;
  const activeSection = sections[sectionId];
  const activeIndex = activeSection.items.findIndex(
    (item) => item.id === active.id
  );
  const activeItem = activeSection.items[activeIndex];
  const generatedItem = {
    id: generateId(),
    content: activeItem.content,
  };
  const newSectionsData = {
    ...sections,
    [sectionId]: {
      ...activeSection,
      items: [
        ...activeSection.items.slice(0, activeIndex),
        generatedItem,
        ...activeSection.items.slice(activeIndex + 1),
      ],
    },
  };
  setSections(newSectionsData);
}

// Helper functions for the hook
function handleSupplyDragEnd(
  active: any,
  over: any,
  sections: Record<string, Section>,
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section>>>
) {
  const sectionId = over.id.startsWith("section-")
    ? over.id.replace("section-", "")
    : findContainer(sections, over.id);

  console.log("sectionId", sectionId);
  if (!sectionId || !sections[sectionId]) return;

  let insertIndex = sections[sectionId].items.length;
  if (!over.id.startsWith("section-")) {
    insertIndex = sections[sectionId].items.findIndex(
      (item) => item.id === over.id
    );
    if (insertIndex === -1) insertIndex = sections[sectionId].items.length;
  }

  const newItem = {
    id: generateId(),
    content:
      active.data.current.content?.props?.children ||
      active.data.current.content,
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

function handleSectionDragOver(
  active: any,
  over: any,
  overSectionId: string,
  sections: Record<string, Section>,
  setSections: React.Dispatch<React.SetStateAction<Record<string, Section>>>
) {
  console.log("active", active);
  console.log("over", over);
  console.log("overSectionId", overSectionId);
  console.log("sections", sections);
  console.log("setSections", setSections);
  console.log("--------------------------------");
  //Dragging from supply logic for sorting animation
  if (active.data.current?.type === "card") {
    if (over.id.startsWith("section-")) return;

    const overSection = sections[overSectionId];
    const overIndex = overSection.items.findIndex(
      (item) => item.id === over.id
    );
    const newIndex = overIndex === -1 ? overSection.items.length : overIndex;

    return setSections((prev) => ({
      ...prev,
      [overSectionId]: {
        ...overSection,
        items: [
          ...overSection.items.slice(0, newIndex),
          {
            id: active.id,
            content: active.data?.current?.content?.props?.children,
          },
          ...overSection.items.slice(newIndex),
        ],
      },
    }));
  }

  // Regular section-to-section dragging
  const activeSectionId = findContainer(sections, active.id);
  if (!activeSectionId || activeSectionId === overSectionId) return;

  setSections((prev) => {
    const activeSection = prev[activeSectionId];
    const overSection = prev[overSectionId];
    const activeIndex = activeSection.items.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = overSection.items.findIndex(
      (item) => item.id === over.id
    );

    const newIndex = overIndex === -1 ? overSection.items.length : overIndex;

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
