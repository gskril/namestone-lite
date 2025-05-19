import { useLocalStorage } from 'usehooks-ts'

export function useLocalApiKey(domain: string | undefined) {
  const [apiKey, setApiKey, deleteApiKey] = useLocalStorage<string | undefined>(
    `namestone_${domain}`,
    ''
  )

  return { apiKey, setApiKey, deleteApiKey }
}

export function setApiKey(domain: string, apiKey: string) {
  localStorage.setItem(`namestone_${domain}`, apiKey)
}

export function getApiKey(domain: string | undefined) {
  if (!domain) return undefined
  return localStorage.getItem(`namestone_${domain}`)
}
