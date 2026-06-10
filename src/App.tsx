import { useCallback, useState } from 'react';
import { Hero } from './components/Hero';
import { QuickAdd } from './components/QuickAdd';
import { AiQuickCapture } from './components/AiQuickCapture';
import { Board } from './components/Board';
import { Toast } from './components/Toast';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Priority, ColumnId } from './types';

function App() {
  const { tasks, addTask, addTasks, moveTask, removeTask, updateTask } = useTasks();
  const { toast, showToast, hideToast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleAdd = useCallback((text: string, priority: Priority) => {
    const newTask = addTask(text, priority);
    showToast({ type: 'ADD', task: newTask });
  }, [addTask, showToast]);

  const handleAddTasks = useCallback((tasksToAdd: { text: string; priority: Priority }[]) => {
    // 複数追加してもToastは最後の1件分で良いか、もしくはToast出さない。今回はシンプルに出さないか、後で対応。
    addTasks(tasksToAdd);
    // showToastが複数に対応していないため、一旦通知なし（必要ならToastを拡張）
  }, [addTasks]);

  const handleMove = useCallback((id: string, toCol: ColumnId, toIndex?: number) => {
    const taskBeforeMove = tasks.find(t => t.id === id);
    if (!taskBeforeMove) return;
    
    const previousCol = taskBeforeMove.col;
    
    if (previousCol !== toCol) {
      moveTask(id, toCol, toIndex);
      showToast({ 
        type: 'MOVE', 
        task: { ...taskBeforeMove, col: toCol }, 
        previousCol 
      });
    } else {
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

  useKeyboardShortcuts({
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    moveTask,
    onUndo: handleUndo,
  });

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8">
      <Hero />
      <AiQuickCapture onAddTasks={handleAddTasks} />
      <QuickAdd onAdd={handleAdd} />
      <Board 
        tasks={tasks} 
        onMoveTask={handleMove} 
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskId}
        onUpdateTask={updateTask}
      />
      <Toast action={toast} onUndo={handleUndo} />
    </div>
  );
}

export default App;
