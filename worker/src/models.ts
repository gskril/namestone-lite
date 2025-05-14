import { type Address, isAddress, isHex } from 'viem'
import { normalize } from 'viem/ens'
import z from 'zod'

export const validator = {
  domain: z
    .string()
    // .optional()
    .refine((value) => {
      if (!value) return true
      return value.includes('.') && value.length > 3
    }),

  // One or more Ethereum addresses (separated by commas)
  addresses: z.coerce
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      return value.split(',').every((address) => isAddress(address))
    })
    .transform((value) => value?.split(',') as Address[]),
  numberBoolean: z.coerce
    .number()
    .optional()
    .transform((val) => val === 1),

  limit: z.coerce.number().optional().default(50),

  offset: z.coerce.number().optional().default(0),

  nameObject: z.object({
    name: z.string().optional(),
    domain: z.string().refine(normalize),
    address: z.string().refine(isAddress).or(z.null()).optional().default(null),
    text_records: z.record(z.string()).optional(),
    coin_types: z.record(z.string().refine(isHex)).optional(),
    contenthash: z.string().or(z.null()).optional().default(null),
  }),
}

export type Name = z.infer<typeof validator.nameObject>
