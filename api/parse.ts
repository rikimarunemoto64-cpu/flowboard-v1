export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid input: text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is not configured on the server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to call AI API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
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
      return new Response(JSON.stringify({ error: 'Failed to parse AI response into tasks.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize priorities
    const validPriorities = ['high', 'mid', 'low'];
    const sanitizedTasks = parsedTasks.map((t: any) => ({
      text: t.text || '無題のタスク',
      priority: validPriorities.includes(t.priority) ? t.priority : 'mid',
    }));

    return new Response(JSON.stringify({ tasks: sanitizedTasks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('API Route Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
