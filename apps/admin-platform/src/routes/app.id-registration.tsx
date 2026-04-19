import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/id-registration')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/id-registration"!</div>
}
