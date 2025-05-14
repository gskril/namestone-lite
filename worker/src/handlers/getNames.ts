import { IRequest } from 'itty-router'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { Name, validator } from '../models'

const schema = z.object({
  domain: validator.domain,
  address: validator.addresses,
  text_records: validator.numberBoolean.default(1),
  limit: validator.limit,
  offset: validator.offset,
})

// https://namestone.com/docs/get-names
export async function getNames(req: IRequest, env: Env) {
  const { domain, address, text_records, limit, offset } = schema.parse(
    req.query
  )

  const db = createKysely(env)

  const parent = await db
    .selectFrom('domain')
    .selectAll()
    .where('name', '=', domain)
    .executeTakeFirst()

  if (!parent) {
    throw new Error('Domain not found')
  }

  const subdomains = await db
    .selectFrom('subdomain')
    .select(['name', 'address', 'contenthash', 'coin_types'])
    .$if(text_records, (qb) => qb.select('text_records'))
    .where('domain_id', '=', parent.id)
    .where('deleted_at', 'is', null)
    .$if(!!address, (qb) => qb.where('address', 'in', address))
    .execute()

  const names: Name[] = subdomains.map((subdomain) => ({
    ...subdomain,
    domain: parent.name,
    text_records: subdomain.text_records
      ? JSON.parse(subdomain.text_records)
      : undefined,
    coin_types: subdomain.coin_types
      ? JSON.parse(subdomain.coin_types)
      : undefined,
  }))

  return Response.json(names)
}
