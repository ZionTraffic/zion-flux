import { router } from "../../trpc";
import { hiRoute } from "./hi/route";

export const exampleRouter = router({
  hi: hiRoute,
});

export type ExampleRouter = typeof exampleRouter;
