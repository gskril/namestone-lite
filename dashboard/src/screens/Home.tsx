import {
  injected,
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
} from 'wagmi'

import { NamesTable } from '@/components/Table'
import { Button } from '@/components/ui/button'
import { useDomains } from '@/hooks/useDomains'
import { AddDomain } from '@/components/AddDomain'
import { Link } from 'react-router-dom'
import { truncateAddress } from '@/lib/utils'

export function Home() {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: domains } = useDomains()

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold">NameStone Admin Dashboard</h1>
        <div>
          {address ? (
            <div className="flex gap-2">
              <Button variant="secondary">
                {ensName ?? truncateAddress(address)}
              </Button>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </div>
          ) : (
            <Button onClick={() => connect({ connector: injected() })}>
              Connect
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_3fr] gap-4">
        <div className="border-r border-gray-200 pr-4">
          <h2 className="pb-2 text-lg font-bold">Domains</h2>
          <div className="flex flex-col gap-2">
            {domains?.map((domain) => (
              <Link key={domain.name} to={`/${domain.name}`}>
                {domain.name}
              </Link>
            ))}

            <AddDomain />
          </div>
        </div>

        <NamesTable />
      </div>
    </div>
  )
}
