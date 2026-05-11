import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/sector-management/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/sector-management/"!</div>
}
