import { IRequest } from 'itty-router'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { Name, validator } from '../models'

const schema = z.object({
  domain: validator.domain,
})

// https://namestone.com/docs/get-domain
export async function getDomain(req: IRequest, env: Env) {
  const { domain } = schema.parse(req.query)

  const db = createKysely(env)

  const parent = await db
    .selectFrom('domain')
    .selectAll()
    .where('name', '=', domain)
    .executeTakeFirst()

  if (!parent) {
    throw new Error('Domain not found')
  }

  const formattedParent: Name = {
    domain: parent.name,
    address: parent.address ?? undefined,
    contenthash: parent.contenthash ?? undefined,
    text_records: parent.text_records
      ? JSON.parse(parent.text_records)
      : undefined,
    coin_types: parent.coin_types ? JSON.parse(parent.coin_types) : undefined,
  }

  return Response.json(formattedParent)
}
