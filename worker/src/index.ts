import { AutoRouter, IRequest, cors } from 'itty-router'

import { Env } from './env'
import { getNames, setDomain, setName } from './handlers'

const { preflight, corsify } = cors()

type CFArgs = [Env, ExecutionContext]

const router = AutoRouter<IRequest, CFArgs>({
  before: [preflight],
  finally: [corsify],
})

router
  // .get('/get-domain', (req, env) => getDomain(req, env))
  .get('/get-names', (req, env) => getNames(req, env))
  .get('/health', () => Response.json({ success: true }))
  .post('/set-domain', (req, env) => setDomain(req, env))
  // .post('/set-name', (req, env) => setName(req, env))
  .all('*', () => new Response('Not found', { status: 404 }))

export default router
