import NameStone from '@namestone/namestone-sdk'
import { env } from './env'

export const namestoneClient = (apiKey?: string) =>
  new NameStone(apiKey, { baseUrl: env.apiUrl })
