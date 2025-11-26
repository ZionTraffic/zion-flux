import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createTRPCContext } from "./trpc/create-context";

const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (opts) =>
      createTRPCContext({ request: (opts.req as any).raw ?? opts.req }),
  })
);

export default app;
export type { appRouter };

const port = Number(((globalThis as any).process?.env?.PORT as string | undefined) ?? 8787);

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Hono backend ready on http://localhost:${port}`);
