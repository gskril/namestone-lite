import { IRequest } from 'itty-router'
import { Address, isAddress, isHex, namehash, parseAbi } from 'viem'
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

  const owner = await getOwner(domain, env)

  if (owner !== address) {
    return Response.json(
      { success: false, error: 'Your wallet needs to own the domain' },
      { status: 400 }
    )
  }

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
      network: 1,
    })
    .onConflict((oc) =>
      oc.columns(['name', 'network']).doUpdateSet({
        updated_at: new Date().toISOString(),
      })
    )
    .returning(['id'])
    .executeTakeFirst()

  if (!domainInsert) {
    return Response.json(
      { success: false, error: 'Failed to create domain' },
      { status: 400 }
    )
  }

  // Make the address an admin of the domain
  await db
    .insertInto('admin')
    .values({
      domain_id: domainInsert.id,
      address,
    })
    .onConflict((oc) =>
      oc.columns(['domain_id', 'address']).doUpdateSet({
        address,
      })
    )
    .execute()

  let apiKey: string
  const existingApiKey = await db
    .selectFrom('api_key')
    .where('domain_id', '=', domainInsert.id)
    .where('deleted_at', 'is', null)
    .select('key')
    .executeTakeFirst()

  if (!existingApiKey || cycle_key) {
    // If domain doesn't exist, or it does exist and cycle_key is true, we create a new key
    apiKey = crypto.randomUUID()
    await db
      .insertInto('api_key')
      .values({
        domain_id: domainInsert.id,
        key: apiKey,
      })
      .execute()
  } else {
    // If domain exists and cycle_key is false, we return the existing key
    apiKey = existingApiKey.key
  }

  await db.deleteFrom('siwe').where('address', '=', address).execute()

  return Response.json({ message: 'Domain enabled!', api_key: apiKey, domain })
}

async function getOwner(domain: string, env: Env) {
  let owner: Address
  const client = getPublicClient(env)

  const registryOwner = await client.readContract({
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    abi: parseAbi(['function owner(bytes32) view returns (address)']),
    functionName: 'owner',
    args: [namehash(domain)],
  })
  owner = registryOwner

  const nameWrappers = [
    '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401', // Mainnet
    '0x0635513f179D50A207757E05759CbD106d7dFcE8', // Sepolia
  ]

  if (nameWrappers.includes(registryOwner)) {
    owner = await client.readContract({
      address: registryOwner,
      abi: parseAbi(['function ownerOf(uint256) view returns (address)']),
      functionName: 'ownerOf',
      args: [BigInt(namehash(domain))],
    })
  }

  return owner
}
