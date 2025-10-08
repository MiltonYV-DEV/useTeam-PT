import Board from "./components/Board";
import "./App.css";

function App() {
  // 👇 REEMPLAZAR ESTE ID POR EL QUE TE DEVOLVIÓ EL SEE
  const boardId = "69e6787d3c455f179fa3fb47";

  return (
    <div className="bg-gray-299/50 rounded-xl backdrop-blur-sm shadow-2xl shadow-black/80">
      <Board boardId={boardId} />
    </div>
  );
}

export default App;
