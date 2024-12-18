import { useSortable } from "@dnd-kit/sortable";

export const SortableItem = ({
  id,
  content,
  showHoverState,
}: {
  id: string;
  content: string;
  showHoverState: boolean;
}) => {
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
};
