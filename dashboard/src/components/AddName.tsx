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
import { namestoneClient } from '@/lib/namestone'
import { Input } from './ui/input'
import { toast } from 'sonner'

type Props = {
  apiKey: string
  domain: string
  onSuccess: () => void
}

export function AddName({ apiKey, domain, onSuccess }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const address = formData.get('address') as string

    try {
      await namestoneClient(apiKey).setName({
        domain,
        name,
        address,
      })

      toast.success('Name created')
      onSuccess()
    } catch (error) {
      toast.error('Failed to set name')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Add Name</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a name</AlertDialogTitle>
          <AlertDialogDescription>
            Create a subname under {domain}.
          </AlertDialogDescription>

          <Input
            placeholder="Name"
            name="name"
            form="set-name"
            autoComplete="off"
            data-1p-ignore
          />
          <Input
            placeholder="Address"
            name="address"
            form="set-name"
            autoComplete="off"
            data-1p-ignore
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>

          <form onSubmit={handleSubmit} id="set-name">
            <Button form="set-name" type="submit">
              Add Name
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
