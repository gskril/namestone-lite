import { IRequest } from 'itty-router'
import { isAddress } from 'viem'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { parseVersion } from '../utils'

const schema = z.object({
  address: z.string().refine(isAddress),
  domain: z.string().default('namestone.com'),
  uri: z
    .string()
    .url()
    .default('https://namestone.com/api/public_v1/get-siwe-message'),
})

// https://namestone.com/docs/get-siwe-message
export async function getSiweMessage(req: IRequest, env: Env) {
  parseVersion(req)
  const { address, domain, uri } = schema.parse(req.query)

  const nonce = generateSiweNonce()
  const message = createSiweMessage({
    domain,
    address,
    statement: 'Sign this message to access protected endpoints.',
    uri,
    version: '1',
    chainId: 1,
    nonce,
  })

  const db = createKysely(env)

  await db
    .insertInto('siwe')
    .values({
      address,
      message,
    })
    .onConflict((oc) =>
      oc.columns(['address']).doUpdateSet({
        message,
        created_at: new Date().toISOString(),
      })
    )
    .execute()

  return new Response(message)
}
