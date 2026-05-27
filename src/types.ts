export type Priority = 'high' | 'mid' | 'low';
export type ColumnId = 'todo' | 'doing' | 'review' | 'done';

export interface Task {
  id: string;         // crypto.randomUUID()
  text: string;
  priority: Priority;
  col: ColumnId;
  createdAt: number;
  completedAt?: number; // doneに移動した瞬間に記録
}

export type ToastAction = {
  type: 'ADD' | 'MOVE';
  task: Task;
  previousCol?: ColumnId; // MOVE時に使用
};
