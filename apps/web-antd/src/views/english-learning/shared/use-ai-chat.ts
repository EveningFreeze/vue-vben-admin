import type { ChatMessage } from './types';

const API_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const STORAGE_KEY = 'en-qwen-api-key';

/**
 * 英语学习助教系统提示词
 * 定义 AI 的角色、回答风格和约束
 */
export const SYSTEM_PROMPT = `你是一位专业的英语学习 AI 助教，名叫"智启英语"。你的职责是帮助用户解决英语学习中的各种问题。

## 你的专业领域
- 英语语法（时态、语态、从句、虚拟语气、非谓语动词等）
- 词汇学习（词根词缀、同义辨析、搭配用法）
- 阅读理解（长难句分析、题型技巧、文章结构）
- 写作提升（句式优化、结构组织、地道表达）
- 听力训练（连读弱读、关键词捕捉、题型策略）
- 口语练习（发音纠正、地道表达、对话技巧）
- 备考指导（四六级、考研、雅思、托福）

## 回答规范
1. 优先用**中文解释**核心概念，辅以**英文示例**说明
2. 回答结构：概念解释 → 规则说明 → 典型示例 → 练习建议
3. 示例需要中英文对照，英文用斜体标注
4. 适当使用 emoji 让回答更生动 📚 ✍️ 🎯
5. 遇到复杂问题时，分点说明，层次清晰
6. 不确定的内容要如实告知，不要编造答案

## 限制
- 只回答与英语学习相关的问题
- 对于无关问题，礼貌地引导回英语学习话题
- 不要替用户完成作业或考试题目，而是提供思路和指导`;

let apiKey = '';

/**
 * 读取 localStorage 中的 API Key
 */
export function loadApiKey(): string {
  try {
    apiKey = localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    apiKey = '';
  }
  return apiKey;
}

/**
 * 保存 API Key 到 localStorage
 */
export function setApiKey(key: string): void {
  apiKey = key;
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch { /* ignore */ }
}

/**
 * 检查是否已配置 API Key
 */
export function hasApiKey(): boolean {
  if (!apiKey) loadApiKey();
  return apiKey.length > 0;
}

/**
 * 调用千问 API（流式响应）
 *
 * @param messages 对话历史（不含 system）
 * @param onChunk 每次收到文本块时的回调，用于逐字更新 UI
 * @param onDone 完成回调
 * @param onError 错误回调
 * @param model 模型名，默认 qwen-plus
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void,
  model = 'qwen-plus',
): Promise<void> {
  if (!hasApiKey()) {
    onError('请先配置 API Key');
    return;
  }

  const systemMessage = { role: 'system', content: SYSTEM_PROMPT };
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
