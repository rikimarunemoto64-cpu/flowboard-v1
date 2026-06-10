# FlowBoard v3

FlowBoard is a high-tempo Kanban board application.

## v3 Features
- **AI QuickCapture**: Automatically extract tasks and priorities from natural language text using AI.
- Keyboard navigation
- Mobile-friendly layout
- Drag and drop tasks
- Persistent storage

## Setup Instructions

1. リポジトリをクローンまたはダウンロード
2. `npm install`
3. `.env.example` をコピーして `.env.local` を作成し、`GEMINI_API_KEY` を設定してください。
4. `npm run dev` で開発サーバーを起動 (※AI機能のローカル検証は `npx vercel dev` を使用してください)
5. ブラウザで表示を確認
