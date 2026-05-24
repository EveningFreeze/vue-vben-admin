import { ref } from 'vue';
import type { DictionaryEntry } from './types';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export function useDictionary() {
  const result = ref<DictionaryEntry | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function lookup(word: string) {
    loading.value = true;
    error.value = null;
    result.value = null;
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);
      if (!response.ok) {
        if (response.status === 404) {
          error.value = `未找到单词 "${word}" 的释义`;
        } else {
          error.value = `查询失败 (${response.status})`;
        }
        return;
      }
      const data = await response.json();
      result.value = data[0];
    } catch {
      error.value = '网络请求失败，请检查网络连接';
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    result.value = null;
    error.value = null;
  }

  return { result, loading, error, lookup, clear };
}
