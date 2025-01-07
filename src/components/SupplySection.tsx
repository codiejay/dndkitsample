import { Item } from "../types";
import { DraggableCard } from "./DraggableCard";

export const SupplySection = ({ items }: { items: Item[] }) => {
  console.log("SupplySection items", items);
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
              backgroundColor: "#4454ff",
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
};