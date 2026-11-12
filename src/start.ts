import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { loadRequestPublishedSnapshot, withRequestPublishedSnapshot } from "./lib/published-store-server";

const publishedContentMiddleware = createMiddleware().server(async ({ next }) => {
  if (new URL(getRequest().url).pathname.startsWith("/api/")) return next();
  let snapshot;
  try {
    snapshot = await loadRequestPublishedSnapshot();
  } catch (error) {
    console.error("Could not load published content for SSR:", error);
  }
  return withRequestPublishedSnapshot(snapshot, () => next());
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, publishedContentMiddleware],
}));
