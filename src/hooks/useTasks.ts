import { useState, useCallback, useEffect } from 'react';
import type { Task, ColumnId, Priority } from '../types';

const STORAGE_KEY = 'flowboard:tasks:v1';

const INITIAL_TASKS: Task[] = [
  { id: crypto.randomUUID(), text: 'ピーク前にミルク残量チェック', priority: 'high', col: 'todo', createdAt: Date.now() },
  { id: crypto.randomUUID(), text: '新人パートナーにエスプレッソ抽出を共有', priority: 'mid', col: 'todo', createdAt: Date.now() },
  { id: crypto.randomUUID(), text: '11時 学生ピークの導線を整える', priority: 'high', col: 'doing', createdAt: Date.now() },
  { id: crypto.randomUUID(), text: 'モバイルオーダー受け取り棚の整理', priority: 'low', col: 'doing', createdAt: Date.now() },
  { id: crypto.randomUUID(), text: 'クリスマスブレンドの試飲メモを店長に共有', priority: 'mid', col: 'review', createdAt: Date.now() },
  { id: crypto.randomUUID(), text: '朝の品出しチェックリスト完了', priority: 'low', col: 'done', createdAt: Date.now() },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse tasks from local storage', e);
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((text: string, priority: Priority) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      priority,
      col: 'todo',
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, toCol: ColumnId, toIndex?: number) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      
      const task = prev[taskIndex];
      const isMovingToDone = task.col !== 'done' && toCol === 'done';
      
      const updatedTask = {
        ...task,
        col: toCol,
        completedAt: isMovingToDone ? Date.now() : task.completedAt,
      };

      const newTasks = prev.filter(t => t.id !== id);
      
      if (toIndex !== undefined) {
        newTasks.splice(toIndex, 0, updatedTask);
      } else {
        newTasks.push(updatedTask);
      }
      
      return newTasks;
    });
  }, []);

  return { tasks, setTasks, addTask, removeTask, moveTask };
}
