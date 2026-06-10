import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ColumnId, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../utils';

interface ColumnProps {
  id: ColumnId;
  title: string;
  tasks: Task[];
  selectedTaskId?: string | null;
  setSelectedTaskId?: (id: string | null) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onMoveTask?: (id: string, toCol: ColumnId, toIndex?: number) => void;
}

export function Column({ id, title, tasks, selectedTaskId, setSelectedTaskId, onUpdateTask, onMoveTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: 'Column', id },
  });

  const isWIPWarning = id === 'doing' && tasks.length > 3;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-slate-50 rounded-lg p-4 flex flex-col gap-3 min-h-[500px] border-2 transition-colors",
        isOver ? "border-blue-300 bg-blue-50/50" : (isWIPWarning ? "border-red-300 bg-red-50/30" : "border-transparent")
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className={cn("font-bold", isWIPWarning ? "text-red-600" : "text-slate-700")}>{title}</h2>
        <span className={cn(
          "text-xs font-semibold px-2 py-1 rounded-full",
          isWIPWarning ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"
        )}>
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isSelected={task.id === selectedTaskId}
              onSelect={() => setSelectedTaskId?.(task.id)}
              onUpdate={(updates) => onUpdateTask?.(task.id, updates)}
              onMoveTask={onMoveTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
