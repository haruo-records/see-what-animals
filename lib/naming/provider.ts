import "server-only";

/**
 * Generate a raw name string from the model. Provider is swappable in one place
 * via NAMING_PROVIDER (openai | anthropic). Kept tiny — one short completion.
 */
export async function generateName(prompt: { system: string; user: string }): Promise<string> {
  const provider = (process.env.NAMING_PROVIDER || "openai").toLowerCase();
  return provider === "anthropic" ? viaAnthropic(prompt) : viaOpenAI(prompt);
}

async function viaOpenAI({ system, user }: { system: string; user: string }): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.NAMING_MODEL || "gpt-4o-mini",
      temperature: 1,
      max_tokens: 12,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status} ${await res.text().catch(() => "")}`);
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").toString();
}

async function viaAnthropic({ system, user }: { system: string; user: string }): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.NAMING_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 12,
      system,
      messages: [{ role: "user", content: user }],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status} ${await res.text().catch(() => "")}`);
  const data = await res.json();
  return (data?.content?.[0]?.text ?? "").toString();
}
