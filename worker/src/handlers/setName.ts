import { IRequest } from 'itty-router'
import { Insertable } from 'kysely'
import { z } from 'zod'

import { verifyApiKey } from '../auth'
import { Database, createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'
import { parseVersion } from '../utils'

const schema = validator.nameObject.extend({
  name: z.string().min(1),
})

export async function setName(req: IRequest, env: Env): Promise<Response> {
  const { network } = parseVersion(req)
  const safeParse = schema.safeParse(await req.json())

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

  const { domain, name, address, contenthash, text_records, coin_types } =
    safeParse.data

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
    .select('id')
    .where('name', '=', domain)
    .where('network', '=', network)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!parent) {
    return Response.json(
      { success: false, error: 'Domain not found' },
      { status: 404 }
    )
  }

  const formattedBody: Insertable<Database['subdomain']> = {
    name,
    domain_id: parent.id,
    address,
    contenthash,
    text_records: JSON.stringify(text_records),
    coin_types: JSON.stringify(coin_types),
  }

  await db
    .insertInto('subdomain')
    .values(formattedBody)
    .onConflict((oc) =>
      oc.columns(['name', 'domain_id']).doUpdateSet({
        ...formattedBody,
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })
    )
    .execute()

  return Response.json({ success: true })
}
