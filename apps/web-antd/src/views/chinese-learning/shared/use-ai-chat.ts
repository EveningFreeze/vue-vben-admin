import type { ChatMessage } from './types';

const API_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const STORAGE_KEY = 'zh-uni-qwen-api-key';

export const SYSTEM_PROMPT = `你是一位大学语文 AI 导师，名叫"文学素养提升助手"。你的职责是帮助大学生和研究生解决大学语文学习与研究中的各种问题。

## 你的专业领域
- 文学经典研读（诗经楚辞、唐诗宋词、元曲明清小说、现当代文学、比较文学与世界文学）
- 文学理论与批评（西方文论、中国古代文论、文艺美学、叙事学、文化研究）
- 学术写作指导（论文选题、文献综述、论证方法、学术规范、APA/MLA/GB/T 7714 引用格式）
- 学术阅读方法（批判性阅读、文本细读、理论应用、学术文献分析）
- 古代汉语与训诂（文字学、音韵学、训诂学、语法修辞、古籍校勘）
- 国学经典深造（四书五经、诸子百家、经史子集、传统学术研究方法）
- 语言学研究（现代汉语、古代汉语、社会语言学、认知语言学）

## 回答规范
1. 优先用**中文**解释核心概念，引用**原文**作为例证
2. 回答结构：概念阐释 → 文本分析 → 学术观点 → 延伸思考
3. 引用可靠学术观点和权威文献来佐证
4. 适当使用 emoji 让回答更生动 📚 ✍️ 🎯
5. 复杂问题分层论述，逻辑严密
6. 不确定的内容要如实告知，不要编造答案

## 限制
- 只回答与大学语文、文学研究、学术写作相关的问题
- 对于无关问题，礼貌地引导回学术话题
- 不要替用户完成作业或考试题目，而是提供方法论指导和学术思路`;

let apiKey = '';

export function loadApiKey(): string {
  try {
    apiKey = localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    apiKey = '';
  }
  return apiKey;
}

export function setApiKey(key: string): void {
  apiKey = key;
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch { /* ignore */ }
}

export function hasApiKey(): boolean {
  if (!apiKey) loadApiKey();
  return apiKey.length > 0;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void,
  model = 'qwen-plus',
  systemPrompt?: string,
): Promise<void> {
  if (!hasApiKey()) {
    onError('请先配置 API Key');
    return;
  }

  const systemMessage = { role: 'system', content: systemPrompt || SYSTEM_PROMPT };
  const apiMessages = [
    systemMessage,
    ...messages.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      let errorMsg = `API 请求失败 (${response.status})`;
      try {
        const errBody = await response.json();
        if (errBody?.error?.message) errorMsg = errBody.error.message;
        else if (errBody?.message) errorMsg = errBody.message;
      } catch { /* ignore */ }

      if (response.status === 401) errorMsg = 'API Key 无效，请检查后重试';
      else if (response.status === 429) errorMsg = '请求过于频繁，请稍后重试';

      onError(errorMsg);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('无法读取响应流');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();

        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            onChunk(fullText);
          }
        } catch { /* skip malformed chunk */ }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data:')) {
        const data = trimmed.slice(5).trim();
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    }

    onDone(fullText);
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      onError('网络连接失败，请检查网络设置');
    } else {
      onError(`请求异常：${err instanceof Error ? err.message : '未知错误'}`);
    }
  }
}
