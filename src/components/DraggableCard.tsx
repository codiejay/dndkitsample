import { useDraggable } from "@dnd-kit/core";

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  isDraggedOver?: boolean;
}

export function DraggableCard({
  id,
  children,
  isDraggedOver = false,
}: DraggableCardProps) {
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
