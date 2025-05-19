import { IRequest } from 'itty-router'
import { z } from 'zod'

import { verifyApiKey } from '../auth'
import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'

const schema = z.object({
  name: z.string().min(1),
  domain: validator.domain,
})

// https://namestone.com/docs/delete-name
export async function deleteName(req: IRequest, env: Env) {
  const safeParse = schema.safeParse(await req.json())

  if (!safeParse.success) {
    return Response.json(
      { error: 'Invalid parameters', issues: safeParse.error.issues },
      { status: 400 }
    )
  }

  const { name, domain } = safeParse.data

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
    .selectAll()
    .where('name', '=', domain)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!parent) {
    return Response.json({ error: 'Domain not found' }, { status: 400 })
  }

  const [{ numUpdatedRows }] = await db
    .updateTable('subdomain')
    .where('name', '=', name)
    .where('domain_id', '=', parent.id)
    .set({
      deleted_at: new Date().toISOString(),
    })
    .execute()

  if (numUpdatedRows === 0n) {
    return Response.json({ error: 'Name does not exist' }, { status: 400 })
  }

  return Response.json({ success: true })
}
