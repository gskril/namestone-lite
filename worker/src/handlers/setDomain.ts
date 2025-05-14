import { IRequest } from 'itty-router'
import { Insertable } from 'kysely'

import { Database, createKysely } from '../db/kysely'
import { Env } from '../env'
import { Name, validator } from '../models'

export async function setDomain(req: IRequest, env: Env) {
  const body = validator.nameObject.parse(await req.json())
  console.log(body)
  const db = createKysely(env)

  const formattedBody: Insertable<Database['domain']> = {
    name: body.domain,
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
