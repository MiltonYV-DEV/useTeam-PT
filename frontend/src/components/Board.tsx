import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoard } from "../api";
import { getSocket, joinBoard } from "../socket";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import CardItem from "../dnd/CardItem";
import { moveCard, createCard, deleteCard } from "../api";

type Column = { _id: string; name: string; position: number };
type Card = {
  _id: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  version: number;
};
type BoardResponse = {
  board: { _id: string; name: string };
  columns: Column[];
  cards: Card[];
};

function ColumnContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

export default function Board({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [newTitles, setNewTitles] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery<BoardResponse>({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
  });

  useEffect(() => {
    const socket = getSocket();

    joinBoard(boardId);

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    socket.on("card.created", invalidate);
    socket.on("card.updated", invalidate);
    socket.on("card.moved", invalidate);

    return () => {
      socket.off("card.created");
      socket.off("card.updated");
      socket.off("card.moved");
    };
  }, [boardId, queryClient]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-gray-50 p-3"
            >
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 space-y-3">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-16 animate-pulse rounded-lg border bg-white"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { board, columns, cards } = data;
  const activeCard = cards.find((c) => c._id === activeCardId);

  function onChangeNew(colId: string, v: string) {
    setNewTitles((prev) => ({ ...prev, [colId]: v }));
  }

  async function onAdd(colId: string) {
    const title = (newTitles[colId] || "").trim();
    if (!title) return;
    try {
      await createCard({ boardId, columnId: colId, title });
      setNewTitles((prev) => ({ ...prev, [colId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch (e) {
      console.error("Error creando tarjeta", e);
    }
  }

  async function handleDelete(cardId: string) {
    try {
      await deleteCard(cardId);
    } catch (e) {
      console.error("Error eliminando tarjeta", e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  }

  return (
    <div className="p-6">
      <header className="rounded-xl top-0 z-10 mb-4 flex items-center justify-between border-b border-gray-200 shadow-lg bg-white/35 px-2 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gray-900 text-white grid place-items-center text-xs font-bold">
            KB
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{board.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* acción secundaria */}
          <button
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.99]"
            title="Pronto"
            disabled
          >
            Exportar CSV
          </button>
          {/* acción primaria */}
        </div>
      </header>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveCardId(String(event.active.id))}
        onDragEnd={async (event: DragEndEvent) => {
          const { active, over } = event;
          if (!over) return;

          const activeId = String(active.id);
          const overId = String(over.id);

          // utilidades
          const byId = new Map(cards.map((c) => [c._id, c]));
          const fromCard = byId.get(activeId);
          if (!fromCard) return;

          const isColumnTarget = overId.startsWith("col-");
          const toColumnId = isColumnTarget
            ? overId.replace("col-", "")
            : byId.get(overId)?.columnId;

          if (!toColumnId) return;

          // lista destino ordenada
          const targetList = cards
            .filter((c) => c.columnId === toColumnId)
            .sort((a, b) => a.position - b.position);

          // calcular nueva posición
          let newPos: number;
          if (isColumnTarget) {
            // Soltaste en espacio vacío de la columna -> va al final
            const lastPos = targetList.at(-1)?.position ?? 0;
            newPos = lastPos + 100;
          } else {
            // Soltaste sobre otra card -> tomar promedio entre vecinos
            const idx = targetList.findIndex((c) => c._id === overId);
            const prev = targetList[idx - 1]?.position ?? 0;
            const next = targetList[idx]?.position ?? prev + 200;
            newPos = Math.floor((prev + next) / 2);
          }

          // si no cambia nada, salimos
          if (fromCard.columnId === toColumnId && fromCard.position === newPos)
            return;

          try {
            await moveCard(fromCard._id, toColumnId, newPos);
          } catch (err) {
            console.error("❌ error moviendo tarjeta:", err);
          } finally {
            // refrescar el board (también llegará por WS, pero garantizamos consistencia)
            setActiveCardId(null);
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
          }
        }}
        onDragCancel={() => setActiveCardId(null)}
      >
        <section
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns.length || 1}, minmax(260px, 1fr))`,
          }}
        >
          {columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((col) => {
              const columnCards = cards
                .filter((c) => c.columnId === col._id)
                .sort((a, b) => a.position - b.position);

              return (
                <ColumnContainer key={col._id} id={`col-${col._id}`}>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 shadow-lg p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-800">
                        {col.name}
                      </h2>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
                        {columnCards.length}
                      </span>
                    </div>
                    <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
                      <SortableContext
                        items={columnCards.map((c) => c._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2">
                          {columnCards.map((card) => (
                            <CardItem
                              key={card._id}
                              id={card._id}
                              title={card.title}
                              description={card.description}
                              onDelete={handleDelete}
                            />
                          ))}

                          {columnCards.length === 0 && (
                            <div className="rounded-md border border-dashed border-gray-300 bg-white p-3 text-center text-xs text-gray-400">
                              Sin tarjetas
                            </div>
                          )}
                          <div className="mt-2 space-y-2">
                            <input
                              value={newTitles[col._id] ?? ""}
                              onChange={(e) =>
                                onChangeNew(col._id, e.target.value)
                              }
                              placeholder="Título de la tarjeta…"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                            />
                            <button
                              onClick={() => onAdd(col._id)}
                              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
                            >
                              Añadir
                            </button>
                          </div>
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                </ColumnContainer>
              );
            })}
        </section>
        <DragOverlay>
          {activeCardId ? (
            <CardItem
              id={activeCardId}
              title={activeCard?.title ?? ""}
              description={activeCard?.description}
              onDelete={handleDelete}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
