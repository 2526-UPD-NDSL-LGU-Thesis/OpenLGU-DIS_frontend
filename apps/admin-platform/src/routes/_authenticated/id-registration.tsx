import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/id-registration')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/id-registration"!</div>
}
