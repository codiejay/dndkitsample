import { DndContext } from "@dnd-kit/core";
import "./styles.css";

export default function App() {
  return (
    <DndContext
      onDragEnd={() => {
        console.log("Drag ended");
      }}
    >
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>
    </DndContext>
  );
}
