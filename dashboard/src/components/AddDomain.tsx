import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount, useSignMessage } from 'wagmi'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDomains } from '@/hooks/useDomains'
import { setApiKey } from '@/hooks/useLocalApiKey'
import { useGetSiweMessage } from '@/hooks/useNamestone'
import { namestoneClient } from '@/lib/namestone'

import { Button } from './ui/button'
import { Input } from './ui/input'

export function AddDomain() {
  const { address } = useAccount()
  const domains = useDomains()
  const siwe = useSignMessage()
  const { data: siweMessage } = useGetSiweMessage(address)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const domain = formData.get('domain') as string

    const promise = namestoneClient().enableDomain({
      company_name: 'Fake company',
      email: 'bob@example.com',
      address: address!,
      domain,
      signature: siwe.data!,
    })

    toast.promise(promise, {
      loading: 'Adding domain...',
      success: (res) => {
        setApiKey(domain, res.api_key)
        siwe.reset()
        domains.refetch()

        return {
          message: 'Domain added',
          description: 'API key saved to local storage',
        }
      },
      error: 'Failed to add domain',
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={!address}>
          <Plus />
          Add Domain
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a Domain</AlertDialogTitle>
          <AlertDialogDescription>
            Add a domain to your account.
          </AlertDialogDescription>

          <Input placeholder="Domain" name="domain" form="add-domain" />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>

          <Button
            onClick={() => siwe.signMessage({ message: siweMessage! })}
            disabled={!siweMessage || !!siwe.data}
          >
            1. Sign Message
          </Button>

          <form onSubmit={handleSubmit} id="add-domain">
            <Button form="add-domain" type="submit" disabled={!siwe.data}>
              2. Add Domain
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
