export type SlideType = "hook" | "content" | "cta";
export interface GeneratedSlide { type: SlideType; title: string; body: string }
export interface GeneratedCarousel { slides: GeneratedSlide[]; caption: string }
export interface CarouselRequest { topic: string; clientName: string; voiceTone?: string | null }

const SYSTEM = `Você é um social media brasileiro experiente, que escreve para o Instagram de pequenas e médias empresas.
Escreva como uma pessoa da área falando com um cliente: frases curtas, concretas, com número, exemplo ou situação real.
Estrutura: 1 slide "hook" (até 60 caracteres; abre uma tensão ou curiosidade específica do tema), de 3 a 8 slides "content"
(title até 50 caracteres, body até 150 caracteres, uma ideia por slide, sem repetir o title no body) e 1 slide "cta"
(pedido natural e específico, como "Mande 'visita' no direct e eu te mostro as opções", nunca "Siga para mais dicas").
Legenda do post: primeira linha forte, tom de conversa, 3 a 5 hashtags específicas no fim.
Evite o jeito de texto de IA: nada de "descubra", "mergulhe", "no mundo de hoje", "desbloqueie", "jornada", "revolucione",
"você sabia que", "não é apenas X, é Y", listas de três adjetivos, travessão (—), pontos de exclamação em série,
frases de efeito vazias. Sem emojis nos slides e no máximo um na legenda. Não invente dados, preços ou prazos.
Siga o tom de voz da marca.`;

function userPrompt(r: CarouselRequest) {
  return `Marca: ${r.clientName}\nTom de voz: ${r.voiceTone?.trim() || "claro, direto e próximo"}\nTema: ${r.topic}`;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["slides", "caption"],
  properties: {
    caption: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "body"],
        properties: {
          type: { type: "string", enum: ["hook", "content", "cta"] },
          title: { type: "string" },
          body: { type: "string" },
        },
      },
    },
  },
} as const;

async function viaOpenAI(r: CarouselRequest): Promise<unknown> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY não configurada.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.8,
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt(r) }],
      response_format: { type: "json_schema", json_schema: { name: "carousel", strict: true, schema: SCHEMA } },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0].message.content);
}

async function viaAnthropic(r: CarouselRequest): Promise<unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY não configurada.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 2000,
      system: `${SYSTEM}\nResponda SOMENTE com JSON no formato {"slides":[{"type","title","body"}],"caption":""}.`,
      messages: [{ role: "user", content: userPrompt(r) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const text = data.content.find((c) => c.type === "text")?.text ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

function viaMock(r: CarouselRequest): GeneratedCarousel {
  return {
    caption: `${r.topic}\n\nSalve este post e compartilhe com quem precisa.\n\n#${r.clientName.replace(/\W+/g, "")} #dicas #conteudo`,
    slides: [
      { type: "hook", title: r.topic, body: "" },
      { type: "content", title: "Primeiro ponto", body: "Explique a ideia em uma ou duas frases curtas." },
      { type: "content", title: "Segundo ponto", body: "Traga um exemplo prático que o seu público reconheça." },
      { type: "content", title: "Terceiro ponto", body: "Mostre o erro mais comum e como evitar." },
      { type: "cta", title: "Quer saber mais?", body: "Chame no direct e fale com a gente." },
    ],
  };
}

/** Valida e normaliza a resposta do modelo para a estrutura que os templates esperam. */
export function normalize(raw: unknown): GeneratedCarousel {
  const o = raw as { slides?: unknown; caption?: unknown };
  if (!o || !Array.isArray(o.slides)) throw new Error("Resposta da IA sem slides.");
  const clean = (o.slides as Record<string, unknown>[])
    .map((s) => ({
      type: (["hook", "content", "cta"].includes(String(s.type)) ? s.type : "content") as SlideType,
      title: String(s.title ?? "").trim(),
      body: String(s.body ?? "").trim(),
    }))
    .filter((s) => s.title);
  const hook = clean.find((s) => s.type === "hook") ?? clean[0];
  const cta = [...clean].reverse().find((s) => s.type === "cta");
  const content = clean.filter((s) => s !== hook && s !== cta).slice(0, 8).map((s) => ({ ...s, type: "content" as const }));
  if (!hook || content.length < 1) throw new Error("A IA devolveu slides insuficientes.");
  const slides = [{ ...hook, type: "hook" as const }, ...content, ...(cta ? [{ ...cta, type: "cta" as const }] : [])];
  return { slides, caption: String(o.caption ?? "").trim() };
}

export async function generateCarousel(r: CarouselRequest): Promise<GeneratedCarousel> {
  const provider = process.env.LLM_PROVIDER || "openai";
  if (provider === "mock") return viaMock(r);
  const raw = provider === "anthropic" ? await viaAnthropic(r) : await viaOpenAI(r);
  return normalize(raw);
}
