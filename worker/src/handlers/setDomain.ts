import { IRequest } from 'itty-router'
import { Insertable } from 'kysely'

import { verifyApiKey } from '../auth'
import { Database, createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'
import { parseVersion } from '../utils'

export async function setDomain(req: IRequest, env: Env) {
  const { network } = parseVersion(req)
  const safeParse = validator.nameObject.safeParse(await req.json())

  if (!safeParse.success) {
    return Response.json(
      { success: false, error: safeParse.error },
      { status: 400 }
    )
  }

  const body = safeParse.data
  const db = createKysely(env)

  const isAuthed = await verifyApiKey({ req, domain: body.domain, db })

  if (!isAuthed) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const formattedBody: Insertable<Database['domain']> = {
    name: body.domain,
    address: body.address,
    contenthash: body.contenthash,
    text_records: JSON.stringify(body.text_records),
    coin_types: JSON.stringify(body.coin_types),
    network,
  }

  await db
    .insertInto('domain')
    .values(formattedBody)
    .onConflict((oc) =>
      oc.columns(['name', 'network']).doUpdateSet({
        ...formattedBody,
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })
    )
    .execute()

  return Response.json({ success: true })
}
