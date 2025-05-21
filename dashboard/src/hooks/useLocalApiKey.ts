export function setApiKey(domain: string, apiKey: string) {
  localStorage.setItem(`namestone_${domain}`, apiKey)
}

export function getApiKey(domain: string | undefined) {
  if (!domain) return undefined
  return localStorage.getItem(`namestone_${domain}`)
}
