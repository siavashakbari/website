export interface TelegramMessageRef {
  message_id: number;
}

type TelegramResult = TelegramMessageRef | TelegramMessageRef[];

/** Telegram returns HTTP 200 for some API-level failures, so both layers must be checked. */
export async function sendTelegram<T extends TelegramResult>(
  token: string,
  method: "sendMessage" | "sendPhoto" | "sendMediaGroup" | "sendDocument",
  payload: Record<string, unknown> | FormData,
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const response = await fetcher(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    ...(payload instanceof FormData
      ? { body: payload }
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
    signal: AbortSignal.timeout(45_000),
  });
  let body: { ok?: boolean; result?: T; description?: string };
  try {
    body = await response.json();
  } catch {
    throw new Error(`Telegram ${method} returned an invalid response (${response.status}).`);
  }
  if (!response.ok || !body.ok || !body.result) {
    throw new Error(
      `Telegram ${method} failed (${response.status}): ${body.description || "unknown error"}`,
    );
  }
  return body.result;
}

export function telegramMessageIds(result: TelegramResult): number[] {
  const messages = Array.isArray(result) ? result : [result];
  const ids = messages.map((message) => message.message_id);
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new Error("Telegram did not return valid message IDs.");
  }
  return ids;
}
