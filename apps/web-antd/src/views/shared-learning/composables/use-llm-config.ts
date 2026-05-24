import { ref, watch } from 'vue';

export interface LLMConfig {
  provider: 'tongyi' | 'openai' | 'custom';
  apiUrl: string;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'sg-llm-config';

const PRESETS: Record<'tongyi' | 'openai' | 'custom', LLMConfig> = {
  tongyi: {
    provider: 'tongyi',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    apiKey: '',
    model: 'qwen-plus',
  },
  openai: {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-3.5-turbo',
  },
  custom: {
    provider: 'custom',
    apiUrl: '',
    apiKey: '',
    model: '',
  },
};

function loadConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.provider && parsed.apiUrl) return { ...PRESETS.custom, ...parsed } as LLMConfig;
    }
  } catch {}
  return PRESETS.tongyi;
}

const config = ref<LLMConfig>(loadConfig());

watch(config, (val) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)); } catch {}
}, { deep: true });

export function useLLMConfig() {
  const isConfigured = (): boolean => {
    return !!(config.value.apiUrl && config.value.apiKey);
  };

  const setProvider = (provider: 'tongyi' | 'openai' | 'custom') => {
    config.value = PRESETS[provider];
  };

  const updateConfig = (patch: Partial<LLMConfig>) => {
    config.value = { ...config.value, ...patch } as LLMConfig;
  };

  const testConnection = async (): Promise<{ ok: boolean; message: string }> => {
    if (!isConfigured()) {
      return { ok: false, message: '请先配置 API 地址和密钥' };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(config.value.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.value.apiKey}`,
        },
        body: JSON.stringify({
          model: config.value.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) return { ok: true, message: `连接成功 ✅ (${config.value.model})` };
      const errText = await response.text();
      return { ok: false, message: `API 返回错误 ${response.status}: ${errText.slice(0, 80)}` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      return { ok: false, message: `连接失败: ${msg}` };
    }
  };

  return { config, isConfigured, setProvider, updateConfig, testConnection, PRESETS };
}
