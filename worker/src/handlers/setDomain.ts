import { IRequest } from 'itty-router'
import { Insertable } from 'kysely'

import { Database, createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'

export async function setDomain(req: IRequest, env: Env) {
  const safeParse = validator.nameObject.safeParse(await req.json())

  if (!safeParse.success) {
    return Response.json(
      { success: false, error: safeParse.error },
      { status: 400 }
    )
  }

  const body = safeParse.data
  const db = createKysely(env)

  const formattedBody: Insertable<Database['domain']> = {
    name: body.domain,
    address: body.address,
    contenthash: body.contenthash,
    text_records: JSON.stringify(body.text_records),
    coin_types: JSON.stringify(body.coin_types),
    network: 1,
  }

  await db
    .insertInto('domain')
    .values(formattedBody)
    .onConflict((oc) =>
      oc.columns(['name', 'network']).doUpdateSet(formattedBody)
    )
    .execute()

  return Response.json({ success: true })
}
