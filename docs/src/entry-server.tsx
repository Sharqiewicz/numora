import { StartServer } from '@tanstack/react-start/server'
import { getRouter } from './router'

const router = getRouter()

export default async function handler(request: Request) {
  return StartServer({ router, request })
}
