import type { ToastAction } from '../types';

interface ToastProps {
  action: ToastAction | null;
  onUndo: () => void;
}

const COLUMN_NAMES: Record<string, string> = {
  todo: 'TO DO',
  doing: '進行中',
  review: 'レビュー',
  done: '完了',
};

export function Toast({ action, onUndo }: ToastProps) {
  if (!action) return null;

  let message = '';
  if (action.type === 'ADD') {
    message = `✓ 追加しました`;
  } else if (action.type === 'MOVE') {
    message = `→ ${COLUMN_NAMES[action.task.col] || action.task.col} に移動`;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <span className="text-sm font-medium">{message}</span>
      <div className="w-px h-4 bg-slate-600"></div>
      <button
        onClick={onUndo}
        className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        元に戻す
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg" style={{ animation: 'shrink 5s linear forwards' }} />
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
