import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-parse-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/parse')) {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              }

              let bodyText = '';
              req.on('data', chunk => {
                bodyText += chunk;
              });

              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyText || '{}');
                  const { text } = body;

                  if (!text || typeof text !== 'string') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Invalid input: text is required' }));
                    return;
                  }

                  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                  if (!apiKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'API key is not configured on the server.' }));
                    return;
                  }

                  const prompt = `
あなたはタスク抽出の専門家です。以下のテキストから、タスクを抽出してJSON配列形式で出力してください。
各タスクは以下のプロパティを持つJSONオブジェクトにしてください：
- text: タスクのタイトル（簡潔に）
- priority: 'high', 'mid', 'low' のいずれか（文脈から推測してください）

注意事項:
- JSONのみを出力してください。バッククォート（\`\`\`json）や説明のテキストは一切含めないでください。
- 配列の形式で返してください。例: [{"text": "タスク1", "priority": "high"}, {"text": "タスク2", "priority": "mid"}]

入力テキスト:
${text}
`;

                  const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                      generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json',
                      }
                    }),
                  });

                  if (!apiResponse.ok) {
                    const errorData = await apiResponse.text();
                    console.error('Gemini API Error:', errorData);
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Failed to call AI API' }));
                    return;
                  }

                  const data = await apiResponse.json();
                  let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

                  // Remove markdown code blocks if present just in case
                  resultText = resultText.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');

                  let parsedTasks;
                  try {
                    parsedTasks = JSON.parse(resultText);
                    if (!Array.isArray(parsedTasks)) {
                      throw new Error('Parsed result is not an array');
                    }
                  } catch (parseError) {
                    console.error('JSON Parse Error:', parseError, 'Raw text:', resultText);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Failed to parse AI response into tasks.' }));
                    return;
                  }

                  const validPriorities = ['high', 'mid', 'low'];
                  const sanitizedTasks = parsedTasks.map((t: any) => ({
                    text: t.text || '無題のタスク',
                    priority: validPriorities.includes(t.priority) ? t.priority : 'mid',
                  }));

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ tasks: sanitizedTasks }));

                } catch (err: any) {
                  console.error('API Route Error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    base: './',
  }
})
