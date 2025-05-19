import { IRequest } from 'itty-router'
import { z } from 'zod'

import { verifyApiKey } from '../auth'
import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { Name, validator } from '../models'

const schema = z.object({
  domain: validator.domain,
  name: z.string().min(1),
  text_records: validator.numberBoolean.default(1),
  limit: validator.limit,
  offset: validator.offset,
  exact_match: validator.numberBoolean.default(0),
})

// https://namestone.com/docs/search-names
export async function searchNames(req: IRequest, env: Env) {
  const safeParse = schema.safeParse(req.query)

  if (!safeParse.success) {
    return Response.json(
      {
        success: false,
        error: 'Invalid parameters',
        issues: safeParse.error.issues,
      },
      { status: 400 }
    )
  }

  const { domain, name, text_records, limit, offset, exact_match } =
    schema.parse(req.query)

  const db = createKysely(env)

  const isAuthed = await verifyApiKey({ request: req, domain, db })

  if (!isAuthed) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const parent = await db
    .selectFrom('domain')
    .select('id')
    .where('name', '=', domain)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!parent) {
    return Response.json(
      { success: false, error: 'Domain not found' },
      { status: 404 }
    )
  }

  const subdomains = await db
    .selectFrom('subdomain')
    .select(['name', 'address', 'contenthash', 'coin_types'])
    .$if(text_records, (qb) => qb.select('text_records'))
    .where('domain_id', '=', parent.id)
    .where('deleted_at', 'is', null)
    .$if(exact_match, (qb) => qb.where('name', '=', name))
    .$if(!exact_match, (qb) => qb.where('name', 'like', `${name}%`))
    .orderBy('name', 'asc')
    .limit(limit)
    .offset(offset)
    .execute()

  const names: Name[] = subdomains.map((subdomain) => ({
    ...subdomain,
    domain,
    text_records: subdomain.text_records
      ? JSON.parse(subdomain.text_records)
      : undefined,
    coin_types: JSON.parse(subdomain.coin_types),
  }))

  return Response.json(names)
}
