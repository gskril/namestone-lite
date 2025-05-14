import { isAddress, isHex } from 'viem'
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
  addresses: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      return value.split(',').every((address) => isAddress(address))
    })
    .transform((value) => value?.split(',')),

  numberBoolean: z.coerce
    .number()
    .optional()
    .default(1)
    .transform((val) => val === 1),

  limit: z.coerce.number().optional().default(50),

  offset: z.coerce.number().optional().default(0),

  nameObject: z.object({
    name: z.string().optional(),
    domain: z.string().refine(normalize),
    address: z.string().refine(isAddress).optional(),
    text_records: z.record(z.string()).optional(),
    coin_types: z.record(z.string().refine(isHex)).optional(),
    contenthash: z.string().optional(),
  }),
}

export type Name = z.infer<typeof validator.nameObject>
