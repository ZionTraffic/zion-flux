import { mergeRouters, router } from "./trpc";
import { exampleRouter } from "./routes/example/router";

export const appRouter = router({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;

export const mergedAppRouter = mergeRouters(appRouter);
