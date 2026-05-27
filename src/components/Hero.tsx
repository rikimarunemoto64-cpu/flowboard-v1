export function Hero() {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        FlowBoard — 現場で1秒、迷わず動くカンバン
      </h1>
      <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
        会議中や現場ピークタイムに、考える前に手が動くタスクボード。タイトルを打って Enter、それだけ。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-lg font-semibold mb-2">🐛 解決するバグ</div>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>入力テンポの悪さ</li>
            <li>誤操作の取り返し</li>
            <li>保存の不安</li>
          </ul>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-lg font-semibold mb-2">👤 誰のため</div>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>会議中の Scrum マスター</li>
            <li>現場のシフトリーダー</li>
          </ul>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-lg font-semibold mb-2">✨ 何が動くか</div>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>QuickAdd + 優先度アイコン</li>
            <li>保存トースト + 5秒Undo</li>
            <li>ドラッグ＆ドロップ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
