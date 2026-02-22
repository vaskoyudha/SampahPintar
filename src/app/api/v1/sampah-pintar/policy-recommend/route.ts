import { NextRequest, NextResponse } from 'next/server';
import { TPA_CITIES } from '@/lib/sampah-pintar/data/tpa-cities';
import type { ApiResponse, PolicyRecommendation, PolicyTarget, WasteCategory } from '@/lib/sampah-pintar/types';

const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;
type ValidCity = (typeof VALID_CITIES)[number];

// --- Inline rate limiter (no external deps) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// --- Hardcoded fallback data per city ---
function getFallbackTargets(cityId: ValidCity): PolicyTarget[] {
  const common: Record<ValidCity, PolicyTarget[]> = {
    jakarta: [
      { category: 'organik', currentRate: 45, targetRate: 65, action: 'Expand composting programs in all 5 administrative cities' },
      { category: 'plastik', currentRate: 12, targetRate: 30, action: 'Deploy reverse vending machines at 500 transit stations' },
      { category: 'kertas', currentRate: 18, targetRate: 35, action: 'Partner with Bank Sampah networks for paper collection' },
      { category: 'logam', currentRate: 8, targetRate: 20, action: 'Introduce metal scrap buy-back incentives at TPS3R' },
      { category: 'kaca', currentRate: 5, targetRate: 15, action: 'Establish glass recycling hubs in industrial zones' },
    ],
    surabaya: [
      { category: 'organik', currentRate: 50, targetRate: 70, action: 'Scale biogas digesters in Surabaya Green program' },
      { category: 'plastik', currentRate: 15, targetRate: 35, action: 'Expand eco-brick collection at community hubs' },
      { category: 'kertas', currentRate: 20, targetRate: 40, action: 'Strengthen university paper recycling partnerships' },
      { category: 'b3', currentRate: 3, targetRate: 10, action: 'Add hazardous waste drop-off points in every kecamatan' },
    ],
    bandung: [
      { category: 'organik', currentRate: 40, targetRate: 60, action: 'Promote household-level composting with subsidized bins' },
      { category: 'plastik', currentRate: 10, targetRate: 28, action: 'Launch plastic bag ban enforcement across traditional markets' },
      { category: 'residu', currentRate: 30, targetRate: 15, action: 'Improve waste sorting education in schools and RT/RW levels' },
      { category: 'kertas', currentRate: 15, targetRate: 30, action: 'Set up paper collection drives with local cooperatives' },
    ],
    semarang: [
      { category: 'organik', currentRate: 38, targetRate: 58, action: 'Build community composting centers in flood-prone kelurahan' },
      { category: 'plastik', currentRate: 9, targetRate: 25, action: 'Partner with informal waste pickers for plastic collection' },
      { category: 'logam', currentRate: 6, targetRate: 18, action: 'Create metal recycling cooperative network' },
      { category: 'kaca', currentRate: 4, targetRate: 12, action: 'Establish glass bottle return programs with local retailers' },
    ],
    makassar: [
      { category: 'organik', currentRate: 35, targetRate: 55, action: 'Deploy mobile composting units in coastal communities' },
      { category: 'plastik', currentRate: 8, targetRate: 22, action: 'Launch fishing community plastic waste collection program' },
      { category: 'kertas', currentRate: 12, targetRate: 25, action: 'Integrate paper recycling into port area waste management' },
      { category: 'b3', currentRate: 2, targetRate: 8, action: 'Establish hazardous waste collection from boat repair yards' },
      { category: 'residu', currentRate: 35, targetRate: 18, action: 'Improve source separation through door-to-door campaigns' },
    ],
  };
  return common[cityId];
}

function getFallbackSummary(cityId: ValidCity, language: 'id' | 'en'): string {
  const city = TPA_CITIES.find((c) => c.city === cityId);
  const capacityPct = city ? Math.round((city.usedCapacityM3 / city.totalCapacityM3) * 100) : 0;

  if (language === 'id') {
    return `${city?.name ?? cityId} saat ini menghadapi tantangan pengelolaan sampah dengan TPA ${city?.tpaName ?? ''} yang telah terisi ${capacityPct}% kapasitas. Diperlukan peningkatan signifikan dalam program daur ulang dan pengomposan untuk mengurangi volume sampah ke TPA. Rekomendasi kebijakan ini menargetkan peningkatan tingkat daur ulang secara bertahap dalam 3-5 tahun ke depan.`;
  }
  return `${city?.name ?? cityId} currently faces waste management challenges with ${city?.tpaName ?? ''} landfill at ${capacityPct}% capacity. Significant improvements in recycling and composting programs are needed to reduce landfill volume. These policy recommendations target gradual recycling rate improvements over the next 3-5 years.`;
}

function getDisclaimer(language: 'id' | 'en'): string {
  if (language === 'id') {
    return 'Dihasilkan oleh AI. Rekomendasi ini bersifat ilustratif dan bukan kebijakan resmi pemerintah. Data yang digunakan merupakan estimasi untuk keperluan perencanaan awal. Konsultasikan dengan Dinas Lingkungan Hidup setempat untuk kebijakan resmi.';
  }
  return 'Generated by AI. These recommendations are illustrative and do not constitute official government policy. Data used are estimates for preliminary planning purposes. Consult your local Environmental Agency for official policies.';
}

function buildFallbackRecommendation(cityId: ValidCity, language: 'id' | 'en'): PolicyRecommendation {
  return {
    cityId,
    language,
    summary: getFallbackSummary(cityId, language),
    targets: getFallbackTargets(cityId),
    disclaimer: getDisclaimer(language),
    generatedAt: new Date().toISOString(),
  };
}

// --- OpenAI LLM integration ---
function buildSystemPrompt(language: 'id' | 'en'): string {
  const lang = language === 'id' ? 'Bahasa Indonesia' : 'English';
  return [
    `You are an expert waste management policy advisor for Indonesian cities. Respond in ${lang}.`,
    'Given city waste data, produce actionable policy recommendations.',
    'Return ONLY valid JSON matching this exact structure (no markdown, no explanation):',
    '{',
    '  "summary": "2-3 sentence executive summary",',
    '  "targets": [',
    '    {',
    '      "category": "organik|plastik|kertas|logam|kaca|b3|residu",',
    '      "currentRate": <number 0-100>,',
    '      "targetRate": <number 0-100>,',
    '      "action": "human-readable action description"',
    '    }',
    '  ],',
    '  "disclaimer": "standard disclaimer noting this is AI-generated and not official government policy"',
    '}',
    'Provide exactly 3-5 targets covering the most relevant waste categories.',
    'currentRate should reflect realistic current recycling/processing rates.',
    'targetRate should be an ambitious but achievable 3-5 year goal.',
  ].join('\n');
}

function buildUserPrompt(cityId: ValidCity, language: 'id' | 'en'): string {
  const city = TPA_CITIES.find((c) => c.city === cityId);
  if (!city) return `Generate waste management policy recommendations for ${cityId}.`;

  const capacityPct = Math.round((city.usedCapacityM3 / city.totalCapacityM3) * 100);
  const lang = language === 'id' ? 'Bahasa Indonesia' : 'English';

  return [
    `City: ${city.name}`,
    `TPA (Landfill): ${city.tpaName}`,
    `Landfill capacity used: ${capacityPct}% (${city.usedCapacityM3.toLocaleString()} of ${city.totalCapacityM3.toLocaleString()} m³)`,
    `Population served: ${city.populationServed.toLocaleString()}`,
    `Daily waste generated: ${city.dailyWasteTons.toLocaleString()} tons/day`,
    `Current recycling rate: ${(city.recyclingRate * 100).toFixed(1)}%`,
    '',
    `Please generate waste management policy recommendations in ${lang}.`,
  ].join('\n');
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: { content: string };
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
  error?: { message: string };
}

function isValidWasteCategory(value: string): value is WasteCategory {
  const categories: ReadonlyArray<string> = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];
  return categories.includes(value);
}

interface RawPolicyTarget {
  category?: unknown;
  currentRate?: unknown;
  targetRate?: unknown;
  action?: unknown;
}

interface RawLLMOutput {
  summary?: unknown;
  targets?: unknown[];
  disclaimer?: unknown;
}

function parseLLMResponse(content: string, cityId: ValidCity, language: 'id' | 'en'): PolicyRecommendation | null {
  // Extract JSON block from potential markdown fencing
  let jsonStr = content.trim();
  const fencedMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fencedMatch) {
    jsonStr = fencedMatch[1].trim();
  }

  try {
    const parsed: unknown = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const data = parsed as RawLLMOutput;
    if (typeof data.summary !== 'string' || !Array.isArray(data.targets)) return null;

    const validTargets: PolicyTarget[] = [];
    for (const raw of data.targets as RawPolicyTarget[]) {
      if (
        typeof raw.category === 'string' &&
        isValidWasteCategory(raw.category) &&
        typeof raw.currentRate === 'number' &&
        typeof raw.targetRate === 'number' &&
        typeof raw.action === 'string'
      ) {
        validTargets.push({
          category: raw.category,
          currentRate: raw.currentRate,
          targetRate: raw.targetRate,
          action: raw.action,
        });
      }
    }

    if (validTargets.length < 3 || validTargets.length > 5) return null;

    return {
      cityId,
      language,
      summary: data.summary,
      targets: validTargets,
      disclaimer: typeof data.disclaimer === 'string' ? data.disclaimer : getDisclaimer(language),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function generateWithOpenAI(cityId: ValidCity, language: 'id' | 'en'): Promise<PolicyRecommendation | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: buildSystemPrompt(language) },
    { role: 'user', content: buildUserPrompt(cityId, language) },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) return null;

    const result: unknown = await response.json();
    if (typeof result !== 'object' || result === null) return null;

    const data = result as OpenAIResponse;
    if (data.error) return null;
    if (!data.choices || data.choices.length === 0) return null;

    const content = data.choices[0].message.content;
    return parseLLMResponse(content, cityId, language);
  } catch {
    return null;
  }
}

// --- Route handler ---

/**
 * POST /api/v1/sampah-pintar/policy-recommend
 * Generates AI-powered waste management policy recommendations for Indonesian cities.
 * Falls back to hardcoded recommendations when OpenAI API key is not configured.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 req/min per IP (OpenAI is expensive)
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  if (!checkRateLimit(ip, 5, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' } satisfies ApiResponse<never>,
      { status: 429 },
    );
  }

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  // Validate body shape
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { success: false, error: 'Request body must be a JSON object' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  const { cityId, language } = body as { cityId?: unknown; language?: unknown };

  // Validate cityId
  if (typeof cityId !== 'string' || !(VALID_CITIES as readonly string[]).includes(cityId)) {
    return NextResponse.json(
      { success: false, error: `Invalid cityId. Valid values: ${VALID_CITIES.join(', ')}` } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  // Validate language
  if (language !== 'id' && language !== 'en') {
    return NextResponse.json(
      { success: false, error: 'Invalid language. Valid values: id, en' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  const validCityId = cityId as ValidCity;

  // Try OpenAI generation, fall back to hardcoded
  const aiResult = await generateWithOpenAI(validCityId, language);
  const recommendation = aiResult ?? buildFallbackRecommendation(validCityId, language);

  return NextResponse.json(
    { success: true, data: recommendation, meta: { timestamp: new Date().toISOString() } } satisfies ApiResponse<PolicyRecommendation>,
  );
}