import OpenAI from "openai";
import {
  resumeExtractionSchema,
  type ResumeExtraction,
} from "../schemas/resume.js";

const SYSTEM = `You extract structured data from resume text. Return only a JSON object (no markdown, no code fences) with these keys:
contact: { fullName, email, phone, location } (strings or null),
summary (string or null),
seniority: one of intern|junior|mid|senior|lead|principal|executive|unknown,
yearsExperienceApprox: integer 0-60 or null,
primaryRole: short string or null,
jobProfileLabels: array of 0-5 strings — prefer: Backend Engineer, Frontend Engineer, Full Stack Engineer, Data Engineer, ML Engineer, DevOps / SRE, Product Manager, Mobile Engineer,
skills: array of concise skill names (e.g. TypeScript, Kubernetes),
workHistory: array of { title, company, startDate, endDate, description },
education: array of { institution, degree, field, endDate },
certifications: optional string array,
languages: optional string array.

Normalize skills. Use ISO-like date strings or human ranges when exact dates are missing. If information is missing, use null or empty arrays.`;

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to apps/api/.env, or set LLM_PROVIDER=ollama for local Ollama."
    );
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

function parseJsonFromLlm(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const body = fence ? fence[1].trim() : trimmed;
  return JSON.parse(body);
}

async function parseWithOpenAI(
  resumeText: string
): Promise<{ data: ResumeExtraction; raw: string }> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const completion = await getOpenAI().chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Resume:\n\n${resumeText.slice(0, 100_000)}`,
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  let json: unknown;
  try {
    json = parseJsonFromLlm(raw);
  } catch {
    throw new Error("LLM returned non-JSON");
  }
  const data = resumeExtractionSchema.parse(json);
  return { data, raw };
}

type OllamaChatResponse = {
  message?: { content?: string };
};

async function parseWithOllama(
  resumeText: string
): Promise<{ data: ResumeExtraction; raw: string }> {
  const base = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(
    /\/$/,
    ""
  );
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Resume:\n\n${resumeText.slice(0, 100_000)}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `Ollama HTTP ${res.status}: ${t || res.statusText}. Is Ollama running and is the model pulled? (ollama pull ${model})`
    );
  }
  const body = (await res.json()) as OllamaChatResponse;
  const raw = body.message?.content ?? "{}";
  let json: unknown;
  try {
    json = parseJsonFromLlm(raw);
  } catch {
    throw new Error("Ollama returned non-JSON; try a larger model or re-prompt.");
  }
  const data = resumeExtractionSchema.parse(json);
  return { data, raw };
}

export async function parseResumeWithLlm(
  resumeText: string
): Promise<{ data: ResumeExtraction; raw: string }> {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  if (provider === "ollama") {
    return parseWithOllama(resumeText);
  }
  if (provider === "openai") {
    return parseWithOpenAI(resumeText);
  }
  throw new Error(
    `Unknown LLM_PROVIDER "${provider}". Use "openai" or "ollama".`
  );
}
