import { useState, useRef } from 'react';
import type { Priority } from '../types';
import { cn } from '../utils';

const PRIORITY_CONFIG: Record<Priority, { label: string; icon: string; color: string }> = {
  high: { label: '高', icon: '🔥', color: 'bg-red-50 text-red-700 border-red-200' },
  mid: { label: '中', icon: '⚡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  low: { label: '低', icon: '🌱', color: 'bg-green-50 text-green-700 border-green-200' },
};

const PRIORITIES: Priority[] = ['high', 'mid', 'low'];

interface QuickAddProps {
  onAdd: (text: string, priority: Priority) => void;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('mid');
  const inputRef = useRef<HTMLInputElement>(null);

  const rotatePriority = () => {
    setPriority(prev => {
      const currentIndex = PRIORITIES.indexOf(prev);
      return PRIORITIES[(currentIndex + 1) % PRIORITIES.length];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = text.trim();
      if (trimmed) {
        onAdd(trimmed, priority);
        setText('');
        // Focus stays on input
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      rotatePriority();
    }
  };

  const currentConfig = PRIORITY_CONFIG[priority];

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="タスクを書いて Enter で投入 / Tab で優先度切替"
          className="w-full py-4 pl-6 pr-32 text-lg bg-white border-2 border-slate-200 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 transition-colors"
          autoFocus
        />
        <button
          type="button"
          onClick={rotatePriority}
          className={cn(
            "absolute right-2 px-3 py-1.5 rounded-md border flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer",
            currentConfig.color
          )}
          title="クリックで優先度を切替"
        >
          <span className="text-lg">{currentConfig.icon}</span>
          <span>{currentConfig.label}</span>
        </button>
      </div>
    </div>
  );
}
