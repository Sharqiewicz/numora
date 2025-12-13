import { createTRPCReact } from '@trpc/react-query'
import type { TRPCRouter } from '@/integrations/trpc/router'

export const trpc = createTRPCReact<TRPCRouter>()

export const TRPCProvider = trpc.Provider
export const useTRPC = trpc
