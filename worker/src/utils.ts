import { IRequest } from 'itty-router'
import { z } from 'zod'

const schema = z
  .string()
  .refine((v) => v === 'v1' || v === 'v1-sepolia', 'Invalid endpoint version')

export function parseVersion(req: IRequest) {
  const version = schema.parse(req.params.version)

  switch (version) {
    case 'v1':
      return { version, network: 1 }
    case 'v1-sepolia':
      return { version, network: 11155111 }
  }
}
