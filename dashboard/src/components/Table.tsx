import { AlertCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Address } from 'viem'
import { useAccount, useEnsAvatar, useEnsName, useSignMessage } from 'wagmi'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApiKey, setApiKey } from '@/hooks/useLocalApiKey'
import { useDomain, useGetSiweMessage, useNames } from '@/hooks/useNamestone'
import { namestoneClient } from '@/lib/namestone'
import { truncateAddress } from '@/lib/utils'

import { AddName } from './AddName'
import { EditName } from './EditName'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function NamesTable() {
  const { address } = useAccount()
  const { domain } = useParams()
  const nsDomain = useDomain(domain)
  const apiKey = getApiKey(domain)
  const names = useNames(domain)
  const { data: siweMessage } = useGetSiweMessage(address)
  const { signMessageAsync } = useSignMessage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{domain}</h2>
        {apiKey && (
          <AddName apiKey={apiKey} domain={domain!} onSuccess={names.refetch} />
        )}
      </div>

      {!!domain && !!address && !apiKey && (
        <div className="border-destructive bg-destructive/1 text-destructive flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium tracking-tight">No API Key</span>
          <Button
            variant="outline"
            className="border-destructive hover:bg-destructive/1 text-destructive! w-fit bg-white"
            onClick={async () => {
              const signature = await signMessageAsync({
                message: siweMessage!,
              })

              const promise = namestoneClient().enableDomain({
                company_name: 'Fake company',
                email: 'bob@example.com',
                address,
                domain,
                signature,
              })

              toast.promise(promise, {
                loading: 'Enabling...',
                success: (res) => {
                  setApiKey(domain, res.api_key)
                  names.refetch()
                  return 'Enabled!'
                },
                error: 'Failed to enable',
              })
            }}
          >
            Enable Domain
          </Button>
        </div>
      )}

      <Tabs defaultValue="names">
        <TabsList className="w-full">
          <TabsTrigger value="names">Names</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="names">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {names.data?.map((name) => (
                <TableRow key={name.name}>
                  <TableCell className="font-medium">{name.name}</TableCell>
                  <TableCell>{name.address}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <EditName
                      apiKey={apiKey!}
                      name={name}
                      onSuccess={names.refetch}
                    />

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const promise = namestoneClient(apiKey!).deleteName({
                          domain: domain!,
                          name: name.name,
                        })

                        toast.promise(promise, {
                          loading: 'Deleting...',
                          success: () => {
                            names.refetch()
                            return 'Deleted!'
                          },
                          error: 'Failed to delete',
                        })

                        names.refetch()
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">
                  {names.data?.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TabsContent>

        <TabsContent value="settings" className="flex flex-col gap-4 pt-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-base font-semibold">API Key</Label>
            <Input disabled value={apiKey ?? ''} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-base font-semibold">Admins</Label>
            <div className="flex flex-col gap-2">
              {nsDomain.data?.admins?.map((admin) => (
                <InlineProfile key={admin} address={admin} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InlineProfile({ address }: { address: Address }) {
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
  })

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className="h-6 w-6 overflow-hidden rounded bg-gray-200">
          {ensAvatar && (
            <img
              src={ensAvatar}
              alt={ensName!}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <span>{ensName || truncateAddress(address)}</span>
      </div>
    </div>
  )
}
