import { IRequest } from 'itty-router'
import { isAddress, isHex } from 'viem'
import { SiweMessage, createSiweMessage, parseSiweMessage } from 'viem/siwe'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'
import { getPublicClient } from '../viem'

const schema = z.object({
  company_name: z.string().min(1),
  email: z.string().email(),
  address: z.string().refine(isAddress),
  domain: validator.domain.refine((value) => value.split('.').length == 2),
  signature: z.string().refine(isHex),
  api_key: z.string().min(1).optional(),
  cycle_key: validator.numberBoolean.optional().default(0),
})

// https://namestone.com/docs/enable-domain
export async function enableDomain(req: IRequest, env: Env) {
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

  const {
    company_name,
    email,
    address,
    domain,
    signature,
    api_key,
    cycle_key,
  } = safeParse.data

  // TODO: Check if the domain is owned by `address` onchain

  const db = createKysely(env)
  const savedSiweMessage = await db
    .selectFrom('siwe')
    .where('address', '=', address)
    .selectAll()
    .executeTakeFirst()

  if (!savedSiweMessage) {
    return Response.json(
      { success: false, error: 'SIWE message not found' },
      { status: 400 }
    )
  }

  const recoveredMessage = createSiweMessage(
    parseSiweMessage(savedSiweMessage.message) as SiweMessage
  )

  const client = getPublicClient(env)
  const isVerified = await client.verifyMessage({
    address,
    signature,
    message: recoveredMessage,
  })

  if (!isVerified) {
    return Response.json(
      { success: false, error: 'Invalid signature' },
      { status: 401 }
    )
  }

  const domainInsert = await db
    .insertInto('domain')
    .values({
      name: domain,
      address,
      admin: JSON.stringify([address]),
      network: 1,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  if (!domainInsert) {
    return Response.json(
      { success: false, error: 'Failed to create domain' },
      { status: 500 }
    )
  }

  const apiKey = crypto.randomUUID()

  await db
    .insertInto('api_key')
    .values({
      domain_id: domainInsert.id,
      key: apiKey,
    })
    .execute()

  await db.deleteFrom('siwe').where('address', '=', address).execute()

  return Response.json({ success: true })
}
