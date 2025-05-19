import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { env } from './lib/env'

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(env.rpcUrl),
  },
})
