import Board from "./components/Board";
import "./App.css";

function App() {
  const boardId = "68e6787d3c455f179fa3fb47";

  return (
    <div className="bg-gray-300/50 mt-[100px] rounded-xl backdrop-blur-sm shadow-2xl shadow-black/80">
      <Board boardId={boardId} />
    </div>
  );
}

export default App;
