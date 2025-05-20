import { IRequest } from 'itty-router'
import { z } from 'zod'

import { verifyApiKey } from '../auth'
import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { Name, validator } from '../models'
import { parseVersion } from '../utils'

const schema = z.object({
  domain: validator.domain,
})

// https://namestone.com/docs/get-domain
export async function getDomain(req: IRequest, env: Env) {
  const { network } = parseVersion(req)
  const safeParse = schema.safeParse(req.query)

  if (!safeParse.success) {
    return Response.json(
      { success: false, error: safeParse.error },
      { status: 400 }
    )
  }

  const { domain } = safeParse.data
  const db = createKysely(env)

  const isAuthed = await verifyApiKey({ req, domain, db })

  if (!isAuthed) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const parent = await db
    .selectFrom('domain')
    .selectAll()
    .where('name', '=', domain)
    .where('network', '=', network)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!parent) {
    throw new Error('Domain not found')
  }

  const admins = await db
    .selectFrom('admin')
    .select(['address'])
    .where('domain_id', '=', parent.id)
    .execute()

  const formattedParent: Name & { admins: string[] } = {
    domain: parent.name,
    address: parent.address,
    contenthash: parent.contenthash,
    text_records: JSON.parse(parent.text_records),
    coin_types: JSON.parse(parent.coin_types),
    admins: admins.map((a) => a.address),
  }

  return Response.json(formattedParent)
}
