import { IRequest } from 'itty-router'
import { isAddress } from 'viem'
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { z } from 'zod'

import { createKysely } from '../db/kysely'
import { Env } from '../env'
import { validator } from '../models'

const schema = z.object({
  address: z.string().refine(isAddress),
  domain: validator.domain.default('namestone.com'),
  uri: z
    .string()
    .url()
    .default('https://namestone.com/api/public_v1/get-siwe-message'),
})

// https://namestone.com/docs/get-siwe-message
export async function getSiweMessage(req: IRequest, env: Env) {
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
        // @ts-expect-error - D1 doesn't like Date objects
        created_at: new Date().toISOString(),
      })
    )
    .execute()

  return new Response(message)
}
