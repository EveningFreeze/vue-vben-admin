<template>
  <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
    <!-- Header / Toggle -->
    <button
      class="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-3">
        <div :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center text-lg',
          isConfigured() ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20',
        ]">
          {{ isConfigured() ? '🧠' : '⚠️' }}
        </div>
        <div class="text-left">
          <div class="text-sm font-bold text-gray-800 dark:text-zinc-100">
            {{ isConfigured() ? `大模型已配置 · ${config.model}` : '大模型评分未配置' }}
          </div>
          <div class="text-[11px] text-gray-400 mt-0.5">
            {{ isConfigured() ? '点击管理 API 设置' : '点击配置通义千问 API 以启用真实评分' }}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="!isConfigured()"
          class="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold"
        >需要配置</span>
        <span
          v-else
          class="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold"
        >已激活</span>
        <span class="text-gray-400 transition-transform" :class="expanded ? 'rotate-180' : ''">▼</span>
      </div>
    </button>

    <!-- Expanded Settings -->
    <div v-if="expanded" class="px-5 pb-5 border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-4">
      <!-- Provider Selector -->
      <div>
        <label class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-2 block">模型供应商</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="(_preset, key) in PRESETS"
            :key="key"
            :class="[
              'p-3 rounded-xl border text-center transition-all',
              config.provider === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600',
            ]"
            @click="setProvider(key as 'tongyi' | 'openai' | 'custom')"
          >
            <div class="text-lg mb-1">{{ key === 'tongyi' ? '☁️' : key === 'openai' ? '🤖' : '⚙️' }}</div>
            <div class="text-[11px] font-bold text-gray-700 dark:text-zinc-300">
              {{ key === 'tongyi' ? '通义千问' : key === 'openai' ? 'OpenAI' : '自定义' }}
            </div>
            <div class="text-[9px] text-gray-400 mt-0.5">
              {{ key === 'tongyi' ? '阿里云' : key === 'openai' ? 'ChatGPT' : '任意兼容接口' }}
            </div>
          </button>
        </div>
      </div>

      <!-- API URL -->
      <div>
        <label class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-2 block">API 地址</label>
        <input
          :value="config.apiUrl"
          type="text"
          placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
          class="w-full px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-zinc-900/50 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
          @input="updateConfig({ apiUrl: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <!-- API Key -->
      <div>
        <label class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-2 block">
          API Key
          <span class="font-normal text-gray-400 ml-1">
            {{ config.provider === 'tongyi' ? '(DashScope API Key)' : '' }}
          </span>
        </label>
        <div class="relative">
          <input
            :value="config.apiKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            class="w-full px-3 py-2.5 pr-16 rounded-lg border bg-slate-50 dark:bg-zinc-900/50 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            @input="updateConfig({ apiKey: ($event.target as HTMLInputElement).value })"
          />
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 px-2 py-1"
            @click="showKey = !showKey"
          >
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
        <p v-if="config.provider === 'tongyi'" class="text-[9px] text-gray-400 mt-1.5">
          前往 <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank" class="text-blue-500 hover:underline">阿里云 DashScope 控制台</a> 获取 API Key
        </p>
      </div>

      <!-- Model -->
      <div>
        <label class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-2 block">模型名称</label>
        <div v-if="config.provider === 'tongyi'" class="grid grid-cols-3 gap-1.5 mb-2">
          <button
            v-for="m in ['qwen-turbo', 'qwen-plus', 'qwen-max']"
            :key="m"
            :class="[
              'px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all',
              config.model === m
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30'
                : 'bg-gray-50 dark:bg-zinc-900/50 text-gray-500 border border-transparent hover:border-gray-300 dark:hover:border-zinc-700',
            ]"
            @click="updateConfig({ model: m })"
          >
            {{ m }}
          </button>
        </div>
        <input
          v-if="config.provider === 'custom' || config.provider === 'openai'"
          :value="config.model"
          type="text"
          :placeholder="config.provider === 'openai' ? 'gpt-3.5-turbo' : 'model-name'"
          class="w-full px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-zinc-900/50 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
          @input="updateConfig({ model: ($event.target as HTMLInputElement).value })"
        />
        <p class="text-[9px] text-gray-400 mt-1.5">
          通义模型对比：<b>qwen-turbo</b> 快速经济 · <b>qwen-plus</b> 均衡推荐 · <b>qwen-max</b> 最强效果
        </p>
      </div>

      <!-- Test Connection -->
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="!isConfigured() || testing"
          @click="handleTest"
        >
          <span v-if="testing" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span v-else>🔌</span>
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <span
          v-if="testResult"
          :class="[
            'text-[11px] font-bold',
            testResult.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
          ]"
        >
          {{ testResult.message }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLLMConfig } from '../composables/use-llm-config';

const { config, isConfigured, setProvider, updateConfig, testConnection, PRESETS } = useLLMConfig();

const expanded = ref(false);
const showKey = ref(false);
const testing = ref(false);
const testResult = ref<{ ok: boolean; message: string } | null>(null);

async function handleTest() {
  testing.value = true;
  testResult.value = null;
  testResult.value = await testConnection();
  testing.value = false;
}
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
