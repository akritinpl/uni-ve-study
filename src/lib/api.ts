export async function postJson<T = unknown>(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; data?: T }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`POST ${url} failed (${res.status}):`, json?.error ?? json);
      return { ok: false };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    console.error(`POST ${url} failed:`, err);
    return { ok: false };
  }
}
