import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Priority } from '../types';
import { cn } from '../utils';

const ICONS: Record<Priority, string> = {
  high: '🔥',
  mid: '⚡',
  low: '🌱',
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white p-3 rounded-md border border-slate-200 shadow-sm flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors",
        isDragging && "opacity-50 border-blue-500 shadow-md ring-1 ring-blue-500"
      )}
    >
      <span className="text-xl shrink-0" title={`優先度: ${task.priority}`}>
        {ICONS[task.priority]}
      </span>
      <span className="text-sm font-medium text-slate-800 break-words line-clamp-2">
        {task.text}
      </span>
    </div>
  );
}
