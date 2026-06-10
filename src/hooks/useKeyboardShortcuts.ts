import { useEffect } from 'react';
import type { Task, ColumnId } from '../types';

const COLUMNS: ColumnId[] = ['todo', 'doing', 'review', 'done'];

interface UseKeyboardShortcutsProps {
  tasks: Task[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  moveTask: (id: string, toCol: ColumnId) => void;
  onUndo: () => void;
}

export function useKeyboardShortcuts({
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  moveTask,
  onUndo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
      
      // Ctrl+Z or Cmd+Z for Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      if (isInput) return;

      if (e.key === 'n') {
        e.preventDefault();
        const quickAddInput = document.querySelector('input[placeholder*="タスクを書いて"]') as HTMLInputElement;
        if (quickAddInput) {
          quickAddInput.focus();
        }
        return;
      }

      // Column navigation for selected task
      if (['1', '2', '3', '4'].includes(e.key)) {
        if (!selectedTaskId) return;
        const colIndex = parseInt(e.key) - 1;
        const toCol = COLUMNS[colIndex];
        if (toCol) {
          e.preventDefault();
          moveTask(selectedTaskId, toCol);
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'l') {
        if (!selectedTaskId) return;
        e.preventDefault();
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task) {
          const colIndex = COLUMNS.indexOf(task.col);
          if (colIndex < COLUMNS.length - 1) {
            moveTask(selectedTaskId, COLUMNS[colIndex + 1]);
          }
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'h') {
        if (!selectedTaskId) return;
        e.preventDefault();
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task) {
          const colIndex = COLUMNS.indexOf(task.col);
          if (colIndex > 0) {
            moveTask(selectedTaskId, COLUMNS[colIndex - 1]);
          }
        }
        return;
      }

      // Selection navigation
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (tasks.length === 0) return;
        
        if (!selectedTaskId) {
          const firstTask = COLUMNS.map(colId => tasks.find(t => t.col === colId)).find(t => !!t);
          if (firstTask) setSelectedTaskId(firstTask.id);
          return;
        }
        
        const currentTask = tasks.find(t => t.id === selectedTaskId);
        if (!currentTask) {
          setSelectedTaskId(tasks[0].id);
          return;
        }

        const colTasks = tasks.filter(t => t.col === currentTask.col);
        const currentIndex = colTasks.findIndex(t => t.id === selectedTaskId);
        
        if (e.key === 'ArrowDown' || e.key === 'j') {
          if (currentIndex < colTasks.length - 1) {
            setSelectedTaskId(colTasks[currentIndex + 1].id);
          }
        } else {
          if (currentIndex > 0) {
            setSelectedTaskId(colTasks[currentIndex - 1].id);
          }
        }
      }

      // Enter for editing is handled in TaskCard or by focusing the element.
      // We will make sure the selected element is focused.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tasks, selectedTaskId, setSelectedTaskId, moveTask, onUndo]);
}
