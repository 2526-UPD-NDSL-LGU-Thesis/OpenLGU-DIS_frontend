import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/service-claim')({
  component: RouteComponent,
})


function RouteComponent() {
  return (
  <main>
    test
  </main>);
}
