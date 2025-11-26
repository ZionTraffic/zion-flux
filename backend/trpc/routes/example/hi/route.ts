import { publicProcedure } from "../../../trpc";
import { z } from "zod";

export const hiRoute = publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    const name = input?.name?.trim();

    return {
      greeting: name ? `Olá, ${name}!` : "Olá, seja bem-vindo ao Próximo de Você!",
    };
  });
