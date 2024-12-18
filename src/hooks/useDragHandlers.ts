import { useState } from 'react';
import { Section } from '../types';
import { findContainer, generateId } from '../utils/helpers';

export function useDragHandlers() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<string>("");

  const handleDragStart = (event: any, sections: Record<string, Section>) => {
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

    if (!overSectionId) return;

    console.log({ active, over, overSectionId });
    if (active.data.current?.type === "section-item") {
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