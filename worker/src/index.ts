import { AutoRouter, cors, IRequest } from 'itty-router'

import { Env } from './env'
import { getDomain, getNames, setName } from './handlers'

const { preflight, corsify } = cors()

type CFArgs = [Env, ExecutionContext]

const router = AutoRouter<IRequest, CFArgs>({
  before: [preflight],
  finally: [corsify],
})

router
  .get('/health', () => Response.json({ success: true }))
  .get('/get-domain', (req, env) => getDomain(req, env))
  .get('/get-names', (req, env) => getNames(req, env))
  .post('/set', (req, env) => setName(req, env))
  .all('*', () => new Response('Not found', { status: 404 }))

export default router
