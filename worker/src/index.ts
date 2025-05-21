import { AutoRouter, IRequest, cors } from 'itty-router'

import { Env } from './env'
import {
  deleteName,
  enableDomain,
  getDomain,
  getDomains,
  getNames,
  getSiweMessage,
  searchNames,
  setDomain,
  setName,
} from './handlers'

const { preflight, corsify } = cors()

type CFArgs = [Env, ExecutionContext]

const router = AutoRouter<IRequest, CFArgs>({
  before: [preflight],
  finally: [corsify],
})

router
  .get('/:version/get-domains', (req, env) => getDomains(req, env))
  .get('/:version/get-domain', (req, env) => getDomain(req, env))
  .get('/:version/get-names', (req, env) => getNames(req, env))
  .get('/:version/get-siwe-message', (req, env) => getSiweMessage(req, env))
  .get('/:version/health', () => Response.json({ success: true }))
  .get('/:version/search-names', (req, env) => searchNames(req, env))
  .post('/:version/delete-name', (req, env) => deleteName(req, env))
  // revoke-name is a legacy route and was renamed to delete-name
  .post('/:version/revoke-name', (req, env) => deleteName(req, env))
  .post('/:version/enable-domain', (req, env) => enableDomain(req, env))
  .post('/:version/set-domain', (req, env) => setDomain(req, env))
  .post('/:version/set-name', (req, env) => setName(req, env))
  .all('*', () => new Response('Not found', { status: 404 }))

export default router
