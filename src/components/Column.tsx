import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ColumnId, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../utils';

interface ColumnProps {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

export function Column({ id, title, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: 'Column', id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-slate-50 rounded-lg p-4 flex flex-col gap-3 min-h-[500px] border-2 transition-colors",
        isOver ? "border-blue-300 bg-blue-50/50" : "border-transparent"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-slate-700">{title}</h2>
        <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
