import { DomainData } from '@namestone/namestone-sdk'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'

import { env } from '@/lib/env'
import { namestoneClient } from '@/lib/namestone'

import { getApiKey } from './useLocalApiKey'

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

export function useDomain(domain: string | undefined) {
  return useQuery({
    queryKey: ['domain', domain],
    queryFn: async () => {
      const apiKey = getApiKey(domain)
      if (!domain || !apiKey) return null

      const client = namestoneClient(apiKey)
      const res = await client.getDomain({ domain })
      // Our API adds the admins, which is different from the official Namestone API
      return res as DomainData[] & { admins: Address[] }
    },
  })
}

export function useGetSiweMessage(address: Address | undefined) {
  return useQuery({
    queryKey: ['siwe-message', address],
    enabled: !!address,
    queryFn: async () => {
      if (!address) return null

      return namestoneClient().getSiweMessage({
        address,
        domain: env.appUrl,
        uri: env.apiUrl,
      })
    },
  })
}
