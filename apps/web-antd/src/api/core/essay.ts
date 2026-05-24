/**
 * LLM Essay Scoring API — Tongyi (通义千问) + OpenAI compatible
 *
 * Configuration priority:
 *   1. localStorage "sg-llm-config" (set via ApiSettingsPanel UI)
 *   2. Environment variables (VITE_LLM_API_URL, VITE_LLM_API_KEY, VITE_LLM_MODEL)
 *   3. Falls back to smart heuristic scoring
 *
 * Tongyi endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
 */

interface LLMConfig {
  provider: string;
  apiUrl: string;
  apiKey: string;
  model: string;
}

function loadLLMConfig(): LLMConfig {
  // 1. Try localStorage (from ApiSettingsPanel UI)
  try {
    const raw = localStorage.getItem('sg-llm-config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiUrl && parsed.apiKey) return parsed;
    }
  } catch {}

  // 2. Fall back to env vars
  return {
    provider: 'env',
    apiUrl: import.meta.env.VITE_LLM_API_URL || '',
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || 'qwen-plus',
  };
}

export interface EssayScoreInput {
  content: string;
  lang: 'en' | 'zh';
  title?: string;
}

export interface EssayScoreResult {
  overallScore: number;
  overallComment: string;
  scores: { id: string; title: string; description: string; score: number; icon: string; comment: string }[];
  suggestions: string[];
  strengths: string[];
  vocabularyAnalysis?: { level: string; diversity: number; advancedWords: string[] };
}

function buildEnglishPrompt(input: EssayScoreInput): string {
  return `You are an expert English writing evaluator. Analyze the following English essay and provide a detailed scoring report in strict JSON format.

Essay:
"""
${input.content}
"""

Return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "overallScore": <number 0-100>,
  "overallComment": "<1-2 sentence overall assessment in Chinese>",
  "scores": [
    { "id": "grammar", "score": <0-100>, "comment": "<specific feedback in Chinese>" },
    { "id": "vocab", "score": <0-100>, "comment": "<specific feedback in Chinese>" },
    { "id": "cohesion", "score": <0-100>, "comment": "<specific feedback in Chinese>" },
    { "id": "style", "score": <0-100>, "comment": "<specific feedback in Chinese>" },
    { "id": "content", "score": <0-100>, "comment": "<specific feedback in Chinese>" },
    { "id": "structure", "score": <0-100>, "comment": "<specific feedback in Chinese>" }
  ],
  "suggestions": ["<3-5 specific improvement suggestions in Chinese>"],
  "strengths": ["<2-3 notable strengths in Chinese>"],
  "vocabularyAnalysis": {
    "level": "<CEFR level: A1/A2/B1/B2/C1/C2>",
    "diversity": <0-100>,
    "advancedWords": ["<3-5 sophisticated words used>"]
  }
}`;
}

function buildChinesePrompt(input: EssayScoreInput): string {
  return `你是一位专业的学术写作评估专家。请对以下中文学术文章进行详细的五维评分，并以严格的 JSON 格式返回结果。

文章：
"""
${input.content}
"""

只返回 JSON 对象（不要 markdown，不要额外文字），结构如下：
{
  "overallScore": <0-100的整数>,
  "overallComment": "<1-2句整体评价>",
  "scores": [
    { "id": "argument", "score": <0-100>, "comment": "<具体评价>" },
    { "id": "structure", "score": <0-100>, "comment": "<具体评价>" },
    { "id": "standard", "score": <0-100>, "comment": "<具体评价>" },
    { "id": "idea", "score": <0-100>, "comment": "<具体评价>" },
    { "id": "source", "score": <0-100>, "comment": "<具体评价>" }
  ],
  "suggestions": ["<3-5条具体修改建议>"],
  "strengths": ["<2-3条突出优点>"]
}`;
}

async function callLLM(config: LLMConfig, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a precise essay scoring engine. You MUST respond with valid JSON only. No markdown, no extra text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM API error: ${response.status}${errText ? ' - ' + errText.slice(0, 100) : ''}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJSON(text: string): string {
  // Try to find JSON in the response, handling markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) return jsonMatch[1].trim();
  // Find first { to last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function parseEnglishResult(json: Record<string, unknown>): EssayScoreResult {
  const scoresArr = (json.scores as Array<Record<string, unknown>>) || [];
  const enCriterionMeta: Record<string, { title: string; icon: string; description: string }> = {
    grammar: { title: 'Grammar (语法)', icon: '📝', description: '时态准确性与复杂句式应用' },
    vocab: { title: 'Vocabulary (词汇)', icon: '📖', description: '学术词汇广度与用词精准度' },
    cohesion: { title: 'Cohesion (连贯)', icon: '🔗', description: '逻辑连接词与段落承接质量' },
    style: { title: 'Writing Style (风格)', icon: '🎨', description: '句式多样性与整体表达效果' },
    content: { title: 'Content (内容)', icon: '💡', description: '论点充分性与论据支撑力度' },
    structure: { title: 'Structure (结构)', icon: '🏗️', description: '文章组织结构与逻辑层次' },
  };

  return {
    overallScore: Math.round(Number(json.overallScore) || 0),
    overallComment: String(json.overallComment || ''),
    scores: scoresArr.map((s: Record<string, unknown>) => {
      const id = String(s.id || '');
      const meta = enCriterionMeta[id] || { title: id, icon: '📊', description: '' };
      return {
        id,
        title: meta.title,
        icon: meta.icon,
        description: meta.description,
        score: Math.round(Number(s.score) || 0),
        comment: String(s.comment || ''),
      };
    }),
    suggestions: (json.suggestions as string[]) || [],
    strengths: (json.strengths as string[]) || [],
    vocabularyAnalysis: json.vocabularyAnalysis ? {
      level: String((json.vocabularyAnalysis as Record<string, unknown>).level || ''),
      diversity: Number((json.vocabularyAnalysis as Record<string, unknown>).diversity || 0),
      advancedWords: ((json.vocabularyAnalysis as Record<string, unknown>).advancedWords as string[]) || [],
    } : undefined,
  };
}

function parseChineseResult(json: Record<string, unknown>): EssayScoreResult {
  const scoresArr = (json.scores as Array<Record<string, unknown>>) || [];
  const zhCriterionMeta: Record<string, { title: string; icon: string; description: string }> = {
    argument: { title: '论点深度', icon: '🎯', description: '论点明确深刻，问题意识清晰' },
    structure: { title: '逻辑结构', icon: '🔗', description: '论证层次清晰，逻辑严谨连贯' },
    standard: { title: '学术规范', icon: '📋', description: '引用准确规范，术语使用恰当' },
    idea: { title: '创新见解', icon: '💎', description: '视角新颖独特，独立思考深入' },
    source: { title: '文献运用', icon: '📚', description: '文献掌握充分，运用恰当有效' },
  };

  return {
    overallScore: Math.round(Number(json.overallScore) || 0),
    overallComment: String(json.overallComment || ''),
    scores: scoresArr.map((s: Record<string, unknown>) => {
      const id = String(s.id || '');
      const meta = zhCriterionMeta[id] || { title: id, icon: '📊', description: '' };
      return {
        id,
        title: meta.title,
        icon: meta.icon,
        description: meta.description,
        score: Math.round(Number(s.score) || 0),
        comment: String(s.comment || ''),
      };
    }),
    suggestions: (json.suggestions as string[]) || [],
    strengths: (json.strengths as string[]) || [],
  };
}

function smartFallbackEnglish(input: EssayScoreInput): EssayScoreResult {
  const content = input.content.trim();
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordLen = words > 0 ? content.replace(/\s+/g, '').length / words : 0;
  const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
  const lexicalDiversity = words > 0 ? Math.min(100, Math.round((uniqueWords / words) * 200)) : 50;

  // Heuristic scoring based on text metrics
  const lengthScore = words < 50 ? 50 : words < 100 ? 60 : words < 200 ? 70 : words < 350 ? 80 : 90;
  const complexityScore = avgWordLen > 5 ? 80 : avgWordLen > 4 ? 70 : 60;
  const sentenceScore = sentences > 5 ? 80 : sentences > 3 ? 70 : 60;

  const baseScore = Math.round((lengthScore + complexityScore + sentenceScore) / 3);
  const jitter = () => Math.floor(Math.random() * 7) - 3;

  return {
    overallScore: Math.min(95, Math.max(40, baseScore + jitter())),
    overallComment: words < 100 ? '文章篇幅较短，建议充实内容以更充分地展开论点。' : '整体写作水平良好，有一定的语言基础，继续加强逻辑衔接和词汇多样性。',
    scores: [
      { id: 'grammar', title: 'Grammar (语法)', icon: '📝', description: '时态准确性与复杂句式应用', score: Math.min(95, Math.max(40, baseScore + 5 + jitter())), comment: '语法基础较扎实，可多尝试复合句式。' },
      { id: 'vocab', title: 'Vocabulary (词汇)', icon: '📖', description: '学术词汇广度与用词精准度', score: Math.min(95, Math.max(40, Math.round((baseScore + lexicalDiversity * 0.3) / 1.3) + jitter())), comment: `词汇多样性 ${lexicalDiversity}%，建议扩充学术词汇。` },
      { id: 'cohesion', title: 'Cohesion (连贯)', icon: '🔗', description: '逻辑连接词与段落承接质量', score: Math.min(95, Math.max(40, baseScore - 5 + jitter())), comment: '段落衔接基本流畅，可增加过渡词。' },
      { id: 'style', title: 'Writing Style (风格)', icon: '🎨', description: '句式多样性与整体表达效果', score: Math.min(95, Math.max(40, complexityScore + jitter())), comment: '表达清晰，建议丰富句式变化。' },
      { id: 'content', title: 'Content (内容)', icon: '💡', description: '论点充分性与论据支撑力度', score: Math.min(95, Math.max(40, sentenceScore + jitter())), comment: '论点明确，可增加具体论据支撑。' },
      { id: 'structure', title: 'Structure (结构)', icon: '🏗️', description: '文章组织结构与逻辑层次', score: Math.min(95, Math.max(40, baseScore + jitter())), comment: '结构基本合理，注意段落比例均衡。' },
    ],
    suggestions: [
      '建议增加更多复合句结构，适当使用定语从句和名词性从句提升语法维度得分。',
      '部分用词较为基础，可尝试使用学术词汇替换，如 "important" → "significant/crucial"。',
      '段落之间的过渡可以更自然，建议增加 "Furthermore/Moreover/In addition" 等连接词。',
      '论据支撑可以更具体，尝试加入数据、事例或引用来增强说服力。',
      '注意主谓一致和时态一致性问题，建议写完后再通读检查一遍。',
    ],
    strengths: ['语言表达清晰流畅', '基本语法掌握良好', '文章结构框架合理'],
    vocabularyAnalysis: {
      level: lexicalDiversity > 80 ? 'C1' : lexicalDiversity > 65 ? 'B2' : lexicalDiversity > 50 ? 'B1' : 'A2',
      diversity: lexicalDiversity,
      advancedWords: content.toLowerCase().split(/\s+/).filter(w => w.length > 7).slice(0, 5),
    },
  };
}

function smartFallbackChinese(input: EssayScoreInput): EssayScoreResult {
  const content = input.content.trim();
  const charCount = content.replace(/\s+/g, '').length;
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  const sentences = content.split(/[。！？；]/).filter(s => s.trim().length > 0).length;

  const lengthScore = charCount < 500 ? 55 : charCount < 1000 ? 65 : charCount < 2000 ? 75 : 85;
  const structureScore = paragraphs >= 3 ? 80 : paragraphs >= 2 ? 70 : 60;
  const sentenceScore = sentences >= 10 ? 80 : sentences >= 5 ? 70 : 60;

  const baseScore = Math.round((lengthScore + structureScore + sentenceScore) / 3);
  const jitter = () => Math.floor(Math.random() * 7) - 3;

  return {
    overallScore: Math.min(95, Math.max(40, baseScore + jitter())),
    overallComment: charCount < 800 ? '文章篇幅较短，建议展开论证，充实分析内容。' : '整体学术水平良好，论证有一定的深度和结构意识。',
    scores: [
      { id: 'argument', title: '论点深度', icon: '🎯', description: '论点明确深刻，问题意识清晰', score: Math.min(95, Math.max(40, baseScore + 10 + jitter())), comment: '论点明确，可进一步加强问题意识。' },
      { id: 'structure', title: '逻辑结构', icon: '🔗', description: '论证层次清晰，逻辑严谨连贯', score: Math.min(95, Math.max(40, structureScore + jitter())), comment: `分为 ${paragraphs} 个段落，结构基本合理。` },
      { id: 'standard', title: '学术规范', icon: '📋', description: '引用准确规范，术语使用恰当', score: Math.min(95, Math.max(40, baseScore - 5 + jitter())), comment: '注意引用格式规范，适当使用学术术语。' },
      { id: 'idea', title: '创新见解', icon: '💎', description: '视角新颖独特，独立思考深入', score: Math.min(95, Math.max(40, baseScore + jitter())), comment: '有一定的独立思考，可进一步挖掘独特视角。' },
      { id: 'source', title: '文献运用', icon: '📚', description: '文献掌握充分，运用恰当有效', score: Math.min(95, Math.max(40, baseScore - 5 + jitter())), comment: '建议增加文献引用以支撑论点。' },
    ],
    suggestions: [
      '建议增加具体事例来支撑论点，使论证更有说服力。',
      '段落之间的过渡可以更自然，尝试使用"因此"、"然而"、"此外"等连接词。',
      '注意语言表达的准确性，避免重复使用同一词汇，适当运用近义词替换。',
      '开篇可以更加引人入胜，尝试使用名言警句或生动描述来吸引读者。',
      '结尾部分应总结全文要点并升华主题，给读者留下深刻印象。',
    ],
    strengths: ['语言表达清晰流畅', '论证思路较为清晰', '能围绕主题展开论述'],
  };
}

/**
 * Score an essay using LLM API with smart fallback.
 *
 * Priority:
 *   1. Tongyi/OpenAI API (if configured via ApiSettingsPanel or env vars)
 *   2. Smart heuristic scoring (text metrics based, no API needed)
 */
export async function scoreEssay(input: EssayScoreInput): Promise<EssayScoreResult> {
  const llmConfig = loadLLMConfig();

  if (!llmConfig.apiUrl || !llmConfig.apiKey) {
    console.info('[EssayScorer] LLM not configured. Use ApiSettingsPanel or set VITE_LLM_API_URL / VITE_LLM_API_KEY.');
    return input.lang === 'zh' ? smartFallbackChinese(input) : smartFallbackEnglish(input);
  }

  try {
    const prompt = input.lang === 'zh' ? buildChinesePrompt(input) : buildEnglishPrompt(input);
    console.info(`[EssayScorer] Calling ${llmConfig.provider} model ${llmConfig.model}...`);
    const responseText = await callLLM(llmConfig, prompt);
    const jsonStr = extractJSON(responseText);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.warn('[EssayScorer] Failed to parse LLM JSON response, using fallback. Raw:', responseText.slice(0, 200));
      return input.lang === 'zh' ? smartFallbackChinese(input) : smartFallbackEnglish(input);
    }

    console.info('[EssayScorer] LLM scoring successful.');
    if (input.lang === 'zh') {
      return parseChineseResult(parsed);
    }
    return parseEnglishResult(parsed);
  } catch (err) {
    console.warn('[EssayScorer] LLM API call failed, using fallback:', err);
    return input.lang === 'zh' ? smartFallbackChinese(input) : smartFallbackEnglish(input);
  }
}
