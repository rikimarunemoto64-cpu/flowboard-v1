import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import type { Task, ColumnId } from '../types';

interface BoardProps {
  tasks: Task[];
  onMoveTask: (id: string, toCol: ColumnId, toIndex?: number) => void;
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'TO DO' },
  { id: 'doing', title: '進行中' },
  { id: 'review', title: 'レビュー' },
  { id: 'done', title: '完了' },
];

export function Board({ tasks, onMoveTask }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Task over Task
    if (isOverTask) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask && overTask && activeTask.col !== overTask.col) {
        const overIndex = tasks.filter(t => t.col === overTask.col).findIndex(t => t.id === overId);
        onMoveTask(activeId as string, overTask.col, overIndex);
      }
    }

    // Task over Column
    if (isOverColumn) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overColumnId = overId as ColumnId;
      
      if (activeTask && activeTask.col !== overColumnId) {
        onMoveTask(activeId as string, overColumnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (isOverTask) {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        const overTasks = tasks.filter(t => t.col === overTask.col);
        const overIndex = overTasks.findIndex(t => t.id === overId);
        onMoveTask(activeId as string, overTask.col, overIndex);
      }
    } else if (isOverColumn) {
      onMoveTask(activeId as string, overId as ColumnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.col === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
