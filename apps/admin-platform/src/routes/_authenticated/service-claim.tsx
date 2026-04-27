import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/service-claim')({
  component: RouteComponent,
})


function RouteComponent() {
  return (
  <main>
    test
  </main>);
}
