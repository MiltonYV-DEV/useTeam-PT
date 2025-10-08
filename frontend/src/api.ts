const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function getBoard(boardId: string) {
  const res = await fetch(`${API_URL}/boards/${boardId}`);
  if (!res.ok) throw new Error("Error al obtener el tablero");
  return res.json();
}

export async function createCard(input: {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
}) {
  const res = await fetch(`${API_URL}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Error al crear la tarjeta");
  return res.json();
}

export async function moveCard(
  cardId: string,
  toColumnId: string,
  toPosition: number,
) {
  const res = await fetch(`${API_URL}/cards/${cardId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toColumnId, toPosition }),
  });

  if (!res.ok) throw new Error("Error al mover la tarjeta");
  return res.json();
}

export async function deleteCard(cardId: string) {
  const res = await fetch(`${API_URL}/cards/${cardId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la tarjeta");
  return res.json();
}
