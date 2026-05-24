/**
 * Unified AI Service — single entry point for all LLM calls across English, Chinese, and Academic modules.
 *
 * Uses the shared sg-llm-config (configured via ApiSettingsPanel).
 * Supports streaming (SSE) and non-streaming (JSON) calls.
 * Compatible with Tongyi (DashScope), OpenAI, and custom OpenAI-compatible endpoints.
 */

import type { ChatMessage } from '../../english-learning/shared/types';

export interface AIServiceConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

function loadConfig(): AIServiceConfig {
  try {
    const raw = localStorage.getItem('sg-llm-config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiUrl && parsed.apiKey) {
        return { apiUrl: parsed.apiUrl, apiKey: parsed.apiKey, model: parsed.model || 'qwen-plus' };
      }
    }
  } catch {}
  return {
    apiUrl: import.meta.env.VITE_LLM_API_URL || '',
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || 'qwen-plus',
  };
}

export function useAIService() {
  const config = loadConfig();

  const isReady = (): boolean => !!(config.apiUrl && config.apiKey);

  const getHeaders = (extra?: Record<string, string>): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    ...extra,
  });

  /**
   * Streaming chat — calls LLM with SSE and calls onChunk for each text fragment.
   */
  const streamChat = async (
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    onDone: (fullText: string) => void,
    onError: (error: string) => void,
    opts?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<void> => {
    if (!isReady()) { onError('请先配置 AI 接口 (ApiSettingsPanel)'); return; }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: getHeaders({ Accept: 'text/event-stream' }),
        body: JSON.stringify({
          model: opts?.model || config.model,
          messages,
          stream: true,
          temperature: opts?.temperature ?? 0.7,
          max_tokens: opts?.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        let errMsg = `API 请求失败 (${response.status})`;
        if (response.status === 401) errMsg = 'API Key 无效，请检查后重试';
        else if (response.status === 429) errMsg = '请求过于频繁，请稍后重试';
        onError(errMsg);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) { onError('无法读取响应流'); return; }

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
            const content = JSON.parse(data).choices?.[0]?.delta?.content || '';
            if (content) { fullText += content; onChunk(fullText); }
          } catch {}
        }
      }
      if (buffer.trim() && buffer.trim().startsWith('data:')) {
        const data = buffer.trim().slice(5).trim();
        if (data !== '[DONE]') {
          try {
            const content = JSON.parse(data).choices?.[0]?.delta?.content || '';
            if (content) fullText += content;
          } catch {}
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
  };

  /**
   * Non-streaming JSON call — sends a prompt and returns raw text response.
   */
  const callJSON = async (
    messages: Array<{ role: string; content: string }>,
    opts?: { temperature?: number; maxTokens?: number; model?: string; timeoutMs?: number },
  ): Promise<string> => {
    if (!isReady()) throw new Error('AI 接口未配置');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 30_000);

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: opts?.model || config.model,
          messages,
          temperature: opts?.temperature ?? 0.3,
          max_tokens: opts?.maxTokens ?? 2000,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`LLM API error: ${response.status}${errText ? ' - ' + errText.slice(0, 100) : ''}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } finally {
      clearTimeout(timeout);
    }
  };

  /**
   * Convenience: call with system prompt + user prompt, return parsed JSON.
   */
  const callStructured = async <T>(
    systemPrompt: string,
    userPrompt: string,
    opts?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<T> => {
    const raw = await callJSON([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], opts);

    const jsonStr = extractJSON(raw);
    return JSON.parse(jsonStr) as T;
  };

  return { config, isReady, streamChat, callJSON, callStructured };
}

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) return jsonMatch[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

// Export standalone helpers for direct use without Vue composable overhead
export function getAIConfig(): AIServiceConfig {
  try {
    const raw = localStorage.getItem('sg-llm-config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiUrl && parsed.apiKey) {
        return { apiUrl: parsed.apiUrl, apiKey: parsed.apiKey, model: parsed.model || 'qwen-plus' };
      }
    }
  } catch {}
  return {
    apiUrl: import.meta.env.VITE_LLM_API_URL || '',
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || 'qwen-plus',
  };
}

export async function aiCallJSON(
  messages: Array<{ role: string; content: string }>,
  opts?: { temperature?: number; maxTokens?: number; model?: string; timeoutMs?: number },
): Promise<string> {
  const config = getAIConfig();
  if (!config.apiUrl || !config.apiKey) throw new Error('AI 接口未配置');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 30_000);
  try {
    const resp = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: opts?.model || config.model,
        messages,
        temperature: opts?.temperature ?? 0.3,
        max_tokens: opts?.maxTokens ?? 2000,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}
