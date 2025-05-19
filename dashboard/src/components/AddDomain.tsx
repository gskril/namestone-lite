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
import { Button } from './ui/button'
import { useAccount, useSignMessage } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { namestoneClient } from '@/lib/namestone'
import { useDomains } from '@/hooks/useDomains'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { setApiKey } from '@/hooks/useLocalApiKey'

export function AddDomain() {
  const { address } = useAccount()
  const domains = useDomains()
  const siwe = useSignMessage()

  const { data: siweMessage } = useQuery({
    queryKey: ['siwe-message', address],
    queryFn: async () =>
      namestoneClient().getSiweMessage({
        address: address!,
        domain: 'localhost:5173',
        uri: 'http://localhost:8787/get-siwe-message',
      }),
    enabled: !!address,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const domain = formData.get('domain') as string

    const res = await namestoneClient().enableDomain({
      company_name: 'Fake company',
      email: 'bob@example.com',
      address: address!,
      domain,
      signature: siwe.data!,
    })

    if (res.api_key) {
      setApiKey(domain, res.api_key)
      toast.success('Domain added', {
        description: 'API key saved to local storage',
      })
    } else {
      toast.error('Failed to add domain')
    }

    siwe.reset()
    domains.refetch()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={!address}>
          Add Domain
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a domain</AlertDialogTitle>
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
