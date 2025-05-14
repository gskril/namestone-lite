import { IRequest } from 'itty-router'
import { verifyMessage } from 'viem'

import { Env } from '../env'
import { get } from './functions/get'
import { set } from './functions/set'

export async function setName(request: IRequest, env: Env): Promise<Response> {
  return Response.json({})
}
