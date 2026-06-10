import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Priority, ColumnId } from '../types';
import { cn } from '../utils';

const ICONS: Record<Priority, string> = {
  high: '🔥',
  mid: '⚡',
  low: '🌱',
};

const COLUMNS_ORDER: ColumnId[] = ['todo', 'doing', 'review', 'done'];

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<Task>) => void;
  onMoveTask?: (id: string, toCol: ColumnId) => void;
}

export function TaskCard({ task, isSelected, onSelect, onUpdate, onMoveTask }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editMemo, setEditMemo] = useState(task.memo || '');
  
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

  const colIndex = COLUMNS_ORDER.indexOf(task.col);
  const canMoveLeft = colIndex > 0;
  const canMoveRight = colIndex < COLUMNS_ORDER.length - 1;

  const handleSave = () => {
    if (editText.trim() !== '') {
      onUpdate?.({ text: editText.trim(), memo: editMemo.trim() });
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        setEditText(task.text);
        setEditMemo(task.memo || '');
        setIsEditing(false);
      }
      e.stopPropagation();
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsEditing(true);
      }
    }
  };

  useEffect(() => {
    setEditText(task.text);
    setEditMemo(task.memo || '');
  }, [task.text, task.memo]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isEditing ? listeners : {})}
      tabIndex={0}
      onClick={() => {
        onSelect?.();
      }}
      onDoubleClick={() => setIsEditing(true)}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-white p-3 rounded-md border shadow-sm flex flex-col gap-2 transition-colors focus:outline-none",
        !isEditing && "cursor-grab active:cursor-grabbing hover:border-slate-300",
        isDragging && "opacity-50 border-blue-500 shadow-md ring-1 ring-blue-500",
        isSelected && !isDragging && "ring-2 ring-blue-500 border-blue-500",
        !isSelected && !isDragging && "border-slate-200"
      )}
    >
      <div className="flex items-start gap-2 w-full">
        <span className="text-xl shrink-0 mt-0.5" title={`優先度: ${task.priority}`}>
          {ICONS[task.priority]}
        </span>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full text-sm font-medium text-slate-800 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                placeholder="タスク名"
              />
              <input
                type="text"
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                className="w-full text-xs text-slate-500 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="1行メモ (任意)"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSave}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full" onClick={() => onSelect?.()}>
              <span className="text-sm font-medium text-slate-800 break-words">
                {task.text}
              </span>
              {task.memo && (
                <span className="text-xs text-slate-500 mt-1 break-words">
                  {task.memo}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile quick move buttons */}
      {!isEditing && onMoveTask && (
        <div className="flex justify-between mt-1 md:hidden gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canMoveLeft) onMoveTask(task.id, COLUMNS_ORDER[colIndex - 1]);
            }}
            disabled={!canMoveLeft}
            className={cn(
              "flex-1 py-1 rounded text-xs font-bold transition-colors",
              canMoveLeft ? "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300" : "bg-transparent text-transparent"
            )}
            aria-label="前のカラムへ移動"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canMoveRight) onMoveTask(task.id, COLUMNS_ORDER[colIndex + 1]);
            }}
            disabled={!canMoveRight}
            className={cn(
              "flex-1 py-1 rounded text-xs font-bold transition-colors",
              canMoveRight ? "bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300" : "bg-transparent text-transparent"
            )}
            aria-label="次のカラムへ移動"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
