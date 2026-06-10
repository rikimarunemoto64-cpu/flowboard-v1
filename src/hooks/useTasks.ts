import { useState, useCallback, useEffect } from 'react';
import type { Task, ColumnId, Priority } from '../types';

const STORAGE_KEY = 'flowboard:tasks:v1';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const INITIAL_TASKS: Task[] = [
  { id: generateId(), text: 'ピーク前にミルク残量チェック', priority: 'high', col: 'todo', createdAt: Date.now() },
  { id: generateId(), text: '新人パートナーにエスプレッソ抽出を共有', priority: 'mid', col: 'todo', createdAt: Date.now() },
  { id: generateId(), text: '11時 学生ピークの導線を整える', priority: 'high', col: 'doing', createdAt: Date.now() },
  { id: generateId(), text: 'モバイルオーダー受け取り棚の整理', priority: 'low', col: 'doing', createdAt: Date.now() },
  { id: generateId(), text: 'クリスマスブレンドの試飲メモを店長に共有', priority: 'mid', col: 'review', createdAt: Date.now() },
  { id: generateId(), text: '朝の品出しチェックリスト完了', priority: 'low', col: 'done', createdAt: Date.now() },
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
      id: generateId(),
      text,
      priority,
      col: 'todo',
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const addTasks = useCallback((tasksToAdd: { text: string; priority: Priority }[]) => {
    const newTasks: Task[] = tasksToAdd.map(t => ({
      id: generateId(),
      text: t.text,
      priority: t.priority,
      col: 'todo',
      createdAt: Date.now(),
    }));
    setTasks(prev => [...prev, ...newTasks]);
    return newTasks;
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

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  return { tasks, setTasks, addTask, addTasks, removeTask, moveTask, updateTask };
}
