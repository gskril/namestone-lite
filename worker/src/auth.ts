import { IRequest } from 'itty-router/types'
import type { Kysely } from 'kysely'

import type { Database } from './db/kysely'

type Props = {
  req: IRequest
  domain: string
  db: Kysely<Database>
}

export async function verifyApiKey({ req, domain, db }: Props) {
  const apiKey = req.headers.get('Authorization')

  if (!apiKey) return false

  // A key can only be used for one domain
  const key = await db
    .selectFrom('api_key')
    .select('domain_id')
    .where('key', '=', apiKey)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!key) return false

  const dbDomain = await db
    .selectFrom('domain')
    .select('name')
    .where('id', '=', key.domain_id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!dbDomain || dbDomain.name !== domain) return false

  return true
}
