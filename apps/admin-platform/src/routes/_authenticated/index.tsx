import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      notice:
        search.notice === "insufficient-permissions"
          ? "insufficient-permissions"
          : undefined,
    }
  },
  component: App,
})

function App() {
  const search = Route.useSearch()

  return (
    <div className="space-y-3">
      {search.notice === "insufficient-permissions" ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You do not have sufficient permissions to access that feature.
        </div>
      ) : null}
      <div>Hello "/routes"!</div>
    </div>
  )
}
