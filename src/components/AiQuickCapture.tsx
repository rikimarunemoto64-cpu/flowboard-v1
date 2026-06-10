import { useState } from 'react';
import type { Priority } from '../types';
import { cn } from '../utils';

interface ExtractedTask {
  text: string;
  priority: Priority;
  selected: boolean;
  id: number;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; icon: string; color: string }> = {
  high: { label: '高', icon: '🔥', color: 'bg-red-50 text-red-700 border-red-200' },
  mid: { label: '中', icon: '⚡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  low: { label: '低', icon: '🌱', color: 'bg-green-50 text-green-700 border-green-200' },
};

interface AiQuickCaptureProps {
  onAddTasks: (tasks: { text: string; priority: Priority }[]) => void;
}

export function AiQuickCapture({ onAddTasks }: AiQuickCaptureProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTasks, setPreviewTasks] = useState<ExtractedTask[]>([]);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '解析に失敗しました');
      }
      
      if (data.tasks && Array.isArray(data.tasks)) {
        const tasksWithSelection = data.tasks.map((t: any, idx: number) => ({
          ...t,
          id: idx,
          selected: true,
        }));
        setPreviewTasks(tasksWithSelection);
      } else {
        throw new Error('不正なレスポンス形式です');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AIとの通信に失敗しました。時間をおいて再試行してください。');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelection = (id: number) => {
    setPreviewTasks(prev => 
      prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t)
    );
  };

  const handleAddAll = () => {
    const selectedTasks = previewTasks.filter(t => t.selected);
    if (selectedTasks.length > 0) {
      onAddTasks(selectedTasks.map(({ text, priority }) => ({ text, priority })));
      // Reset state after adding
      setPreviewTasks([]);
      setInputText('');
    }
  };

  const handleCancel = () => {
    setPreviewTasks([]);
  };

  return (
    <div className="max-w-3xl mx-auto mb-8 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
      <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
        <span>✨</span> AI QuickCapture
      </h2>
      
      {previewTasks.length === 0 ? (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="会議のメモや、頭の中のタスクリストをそのまま貼り付けてください。AIが自動でタスクに分解します。"
            className="w-full h-32 p-3 text-sm bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            disabled={isProcessing}
          />
          
          <div className="flex items-center justify-between">
            {error ? (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                ⚠️ {error}
              </div>
            ) : (
              <div className="text-sm text-indigo-500">
                ※ Vercel Edge Functionsで安全に処理されます
              </div>
            )}
            
            <button
              onClick={handleExtract}
              disabled={isProcessing || !inputText.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  解析中...
                </>
              ) : (
                'タスクを抽出する'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden shadow-sm">
            <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 text-sm font-medium text-indigo-800">
              {previewTasks.filter(t => t.selected).length} 件のタスクが見つかりました
            </div>
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {previewTasks.map(task => {
                const conf = PRIORITY_CONFIG[task.priority];
                return (
                  <li 
                    key={task.id} 
                    className={cn(
                      "flex items-center gap-3 p-3 transition-colors hover:bg-gray-50 cursor-pointer",
                      !task.selected && "opacity-50"
                    )}
                    onClick={() => toggleSelection(task.id)}
                  >
                    <input
                      type="checkbox"
                      checked={task.selected}
                      onChange={() => {}} // handled by li onClick
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span 
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap", 
                        conf.color
                      )}
                    >
                      {conf.icon} {conf.label}
                    </span>
                    <span className={cn("text-sm", !task.selected && "line-through text-gray-400")}>
                      {task.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddAll}
              disabled={previewTasks.filter(t => t.selected).length === 0}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              選択したタスクを追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
