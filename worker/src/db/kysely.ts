import { ColumnType, Generated, GeneratedAlways, Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { Address } from 'viem'

import { Env } from '../env'

// D1 doesn't support JSON yet, we'll have to parse it manually
type JSON = string

interface BaseName {
  id: GeneratedAlways<number>
  name: string
  address: Address | null
  contenthash: string | null
  text_records: Generated<JSON>
  coin_types: Generated<JSON>
  created_at: GeneratedAlways<Date>
  updated_at: ColumnType<Date, never, string | undefined>
  deleted_at: ColumnType<Date, never, string | undefined>
}

export interface Database {
  domain: BaseName & {
    network: number
    name_limit: Generated<number>
    admin: Generated<JSON>
  }

  subdomain: BaseName & {
    domain_id: number
  }

  api_key: {
    id: GeneratedAlways<number>
    domain_id: number
    key: string
    created_at: GeneratedAlways<Date>
    deleted_at: ColumnType<Date, never, string | undefined>
  }

  siwe: {
    address: Address
    message: string
    created_at: ColumnType<Date, never, string | undefined>
  }
}

export function createKysely(env: Env): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  })
}
