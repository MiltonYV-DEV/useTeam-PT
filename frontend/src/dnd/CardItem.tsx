import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  id: string;
  title: string;
  description?: string;
  onDelete?: (id: string) => void;
};

export default function CardItem({ id, title, description, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    setActivatorNodeRef,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    >
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute left-2 top-2 hidden cursor-grab rounded px-1 text-xl text-gray-500 hover:bg-gray-100 group-hover:block active:cursor-grabbing"
        title="Arrastrar"
        aria-label="Arrastrar"
      >
        ⠿
      </button>

      {/* Botón eliminar */}
      {onDelete && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute right-2 top-2 hidden rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 group-hover:block"
          title="Eliminar"
        >
          ✕
        </button>
      )}

      <h3 className="text-sm font-medium text-gray-900 pl-5 pr-7">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-gray-600 pl-5 pr-7">{description}</p>
      ) : null}
    </article>
  );
}
