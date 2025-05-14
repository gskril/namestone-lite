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
  const safeParse = schema.safeParse(req.query)

  if (!safeParse.success) {
    return Response.json(
      { success: false, error: safeParse.error },
      { status: 400 }
    )
  }

  const { domain } = safeParse.data
  const db = createKysely(env)

  const parent = await db
    .selectFrom('domain')
    .selectAll()
    .where('name', '=', domain)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!parent) {
    throw new Error('Domain not found')
  }

  const formattedParent: Name = {
    domain: parent.name,
    address: parent.address,
    contenthash: parent.contenthash,
    text_records: JSON.parse(parent.text_records),
    coin_types: JSON.parse(parent.coin_types),
  }

  return Response.json(formattedParent)
}
