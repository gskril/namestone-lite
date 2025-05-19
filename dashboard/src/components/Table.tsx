import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiKey } from '@/hooks/useLocalApiKey'
import { useNames } from '@/hooks/useNamestone'
import { useParams } from 'react-router-dom'
import { Button } from './ui/button'
import { namestoneClient } from '@/lib/namestone'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AddName } from './AddName'

export function NamesTable() {
  const { domain } = useParams()
  const apiKey = getApiKey(domain)
  const names = useNames(domain)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{domain}</h2>
        {apiKey && (
          <AddName apiKey={apiKey} domain={domain!} onSuccess={names.refetch} />
        )}
      </div>

      {!apiKey && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No API Key</AlertTitle>
          <AlertDescription>
            "Add Domain" on the sidebar to manage this domain.
          </AlertDescription>
        </Alert>
      )}

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
              <TableCell>
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
                      success: 'Deleted!',
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
            <TableCell className="text-right">{names.data?.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
