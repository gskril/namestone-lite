import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { Env } from './env'

export function getPublicClient(env: Env) {
  return createPublicClient({
    chain: mainnet,
    transport: http(env.RPC_URL),
  })
}
