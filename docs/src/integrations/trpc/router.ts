import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from './init';

import { TRPCError, type TRPCRouterRecord } from '@trpc/server';
import { fetchAllTokenPrices, type PriceData } from '@/lib/services/priceService';
import type { NetworkName } from '@/lib/constants/priceFeeds';

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
];

// Starter-template example, kept for local development only. In production it
// answers NOT_FOUND so the public endpoint can't grow the in-memory list.
const devOnlyProcedure = publicProcedure.use(({ next }) => {
  if (!import.meta.env.DEV) throw new TRPCError({ code: 'NOT_FOUND' });
  return next();
});

const todosRouter = {
  list: devOnlyProcedure.query(() => todos),
  add: devOnlyProcedure.input(z.object({ name: z.string() })).mutation(({ input }) => {
    const newTodo = { id: todos.length + 1, name: input.name };
    todos.push(newTodo);
    return newTodo;
  }),
} satisfies TRPCRouterRecord;

const pricesRouter = {
  getAll: publicProcedure
    .input(z.object({ network: z.enum(['mainnet', 'base']).default('mainnet') }))
    .query(async ({ input }): Promise<PriceData> => {
      return await fetchAllTokenPrices(input.network as NetworkName);
    }),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  prices: pricesRouter,
});
export type TRPCRouter = typeof trpcRouter;
