import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from './ui/button'
import { namestoneClient } from '@/lib/namestone'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { NameData } from '@namestone/namestone-sdk'
import { Label } from './ui/label'

type Props = {
  apiKey: string
  name: NameData
  onSuccess: () => void
}

export function EditName({ apiKey, name, onSuccess }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const address = formData.get('address') as string
    const textRecords = formData.get('text_records') as string
    const coinTypes = formData.get('coin_types') as string

    try {
      await namestoneClient(apiKey).setName({
        ...name,
        address,
        text_records: JSON.parse(textRecords),
        coin_types: JSON.parse(coinTypes),
      })

      toast.success('Name updated')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update name')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm">Edit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col gap-4">
          <AlertDialogTitle>
            Edit {name.name}.{name.domain}
          </AlertDialogTitle>

          <div className="flex flex-col gap-1.5">
            <Label>Address</Label>
            <Input
              defaultValue={name.address}
              name="address"
              form="set-name"
              autoComplete="off"
              data-1p-ignore
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Text Records</Label>
            <textarea
              form="set-name"
              name="text_records"
              className="h-40 rounded-md border p-2"
              defaultValue={JSON.stringify(name.text_records || {}, null, 2)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Coin Types</Label>
            <textarea
              form="set-name"
              name="coin_types"
              className="h-40 rounded-md border p-2"
              defaultValue={JSON.stringify(name.coin_types || {}, null, 2)}
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>

          <form onSubmit={handleSubmit} id="set-name">
            <Button form="set-name" type="submit">
              Save
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
