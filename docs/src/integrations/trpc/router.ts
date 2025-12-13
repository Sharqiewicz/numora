import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'

import type { TRPCRouterRecord } from '@trpc/server'
import { fetchAllTokenPrices, type PriceData } from '@/lib/services/priceService'
import type { NetworkName } from '@/lib/constants/priceFeeds'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: publicProcedure.query(() => todos),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

const pricesRouter = {
  getAll: publicProcedure
    .input(z.object({ network: z.enum(['mainnet', 'base']).default('mainnet') }))
    .query(async ({ input }): Promise<PriceData> => {
      return await fetchAllTokenPrices(input.network as NetworkName)
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  prices: pricesRouter,
})
export type TRPCRouter = typeof trpcRouter
