import { useQuery } from '@tanstack/react-query'
import { getApiKey } from './useLocalApiKey'
import { namestoneClient } from '@/lib/namestone'

export function useNames(domain: string | undefined) {
  return useQuery({
    queryKey: ['names', domain],
    queryFn: async () => {
      const apiKey = getApiKey(domain)
      if (!domain || !apiKey) return null

      const client = namestoneClient(apiKey)
      return client.getNames({ domain })
    },
  })
}
