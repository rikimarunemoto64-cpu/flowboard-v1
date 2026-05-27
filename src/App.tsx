import { useCallback } from 'react';
import { Hero } from './components/Hero';
import { QuickAdd } from './components/QuickAdd';
import { Board } from './components/Board';
import { Toast } from './components/Toast';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import type { Priority, ColumnId } from './types';

function App() {
  const { tasks, addTask, moveTask, removeTask } = useTasks();
  const { toast, showToast, hideToast } = useToast();

  const handleAdd = useCallback((text: string, priority: Priority) => {
    const newTask = addTask(text, priority);
    showToast({ type: 'ADD', task: newTask });
  }, [addTask, showToast]);

  const handleMove = useCallback((id: string, toCol: ColumnId, toIndex?: number) => {
    const taskBeforeMove = tasks.find(t => t.id === id);
    if (!taskBeforeMove) return;
    
    const previousCol = taskBeforeMove.col;
    
    // Only show toast if column changed
    if (previousCol !== toCol) {
      moveTask(id, toCol, toIndex);
      // Create a dummy task with the new col for the toast message
      showToast({ 
        type: 'MOVE', 
        task: { ...taskBeforeMove, col: toCol }, 
        previousCol 
      });
    } else {
      // Reordering within the same column
      moveTask(id, toCol, toIndex);
    }
  }, [tasks, moveTask, showToast]);

  const handleUndo = useCallback(() => {
    if (!toast) return;

    if (toast.type === 'ADD') {
      removeTask(toast.task.id);
    } else if (toast.type === 'MOVE' && toast.previousCol) {
      moveTask(toast.task.id, toast.previousCol);
    }
    
    hideToast();
  }, [toast, removeTask, moveTask, hideToast]);

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8">
      <Hero />
      <QuickAdd onAdd={handleAdd} />
      <Board tasks={tasks} onMoveTask={handleMove} />
      <Toast action={toast} onUndo={handleUndo} />
    </div>
  );
}

export default App;
