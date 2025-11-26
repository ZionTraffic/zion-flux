import type { inferAsyncReturnType } from "@trpc/server";

export interface CreateContextOptions {
  request: Request;
}

export async function createTRPCContext({ request }: CreateContextOptions) {
  return {
    request,
  };
}

export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;
