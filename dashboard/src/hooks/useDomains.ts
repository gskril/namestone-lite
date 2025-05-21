import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import { env } from '../lib/env'

export function useDomains() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['domains', address],
    queryFn: async () => {
      if (!address) {
        return null
      }

      const res = await fetch(`${env.apiUrl}/get-domains?address=${address}`)
      const data = (await res.json()) as { domain: string }[]

      return data
    },
  })
}
