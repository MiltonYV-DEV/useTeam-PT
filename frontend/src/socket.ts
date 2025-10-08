import { io, Socket } from "socket.io-client";

// Usa una env separada para WS
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(`${WS_URL}/kanban`, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor WebSocket");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Error de conexión WS:", err.message);
    });

    socket.on("joined", (data) => {
      console.log("🙌 Unido a room:", data.room);
    });
  }
  return socket;
}

export function joinBoard(boardId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("joinBoard", { boardId });
}
