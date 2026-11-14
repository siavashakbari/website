import { test } from "node:test";
import assert from "node:assert/strict";
import { sendTelegram, telegramMessageIds } from "../src/lib/telegram-api.server.ts";

test("Telegram API-level rejection is treated as delivery failure even with HTTP 200", async () => {
  const fakeFetch = async () =>
    Response.json({ ok: false, description: "Bad Request: album must contain 2-10 items" });
  await assert.rejects(
    sendTelegram("test-token", "sendMediaGroup", new FormData(), fakeFetch),
    /Telegram sendMediaGroup failed/,
  );
});

test("a successful single-photo response yields one message ID", async () => {
  let method = "";
  const fakeFetch = async (url) => {
    method = url.split("/").at(-1);
    return Response.json({ ok: true, result: { message_id: 314 } });
  };
  const form = new FormData();
  form.append("photo", new Blob(["gif"], { type: "image/gif" }), "test.gif");
  const result = await sendTelegram("test-token", "sendPhoto", form, fakeFetch);
  assert.equal(method, "sendPhoto");
  assert.deepEqual(telegramMessageIds(result), [314]);
});
