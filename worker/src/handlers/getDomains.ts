import { IRequest } from 'itty-router'
import { isAddress } from 'viem/utils'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { parseVersion } from '../utils'

const schema = z.object({
  address: z.string().refine(isAddress),
})

export async function getDomains(req: IRequest, env: Env) {
  const { network } = parseVersion(req)
  const safeParse = schema.safeParse(req.query)

  if (!safeParse.success) {
    return Response.json(
      { success: false, error: safeParse.error },
      { status: 400 }
    )
  }

  const { address } = safeParse.data
  const db = createKysely(env)

  const admin = await db
    .selectFrom('admin')
    .select(['domain_id'])
    .where('address', '=', address)
    .execute()

  const domains = await db
    .selectFrom('domain')
    .select(['name as domain'])
    .where(
      'id',
      'in',
      admin.map((a) => a.domain_id)
    )
    .where('network', '=', network)
    .where('deleted_at', 'is', null)
    .execute()

  return Response.json(domains)
}
