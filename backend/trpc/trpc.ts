import { initTRPC } from "@trpc/server";
import type { TRPCContext } from "./create-context";

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;
