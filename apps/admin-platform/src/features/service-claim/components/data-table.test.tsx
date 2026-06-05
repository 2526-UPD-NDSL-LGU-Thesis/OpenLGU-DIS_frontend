import type { ColumnDef } from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataTable } from "./data-table"

interface TestRow {
  name: string
  status: string
}

const columns: ColumnDef<TestRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]

describe("DataTable", () => {
  it("renders rows through TanStack table column definitions", () => {
    render(
      <DataTable
        columns={columns}
        data={[
          { name: "Medical", status: "Active" },
          { name: "Funeral", status: "Inactive" },
        ]}
        emptyMessage="No rows"
      />
    )

    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Medical")).toBeInTheDocument()
    expect(screen.getByText("Inactive")).toBeInTheDocument()
  })

  it("renders empty state when no data is available", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No services yet." />)

    expect(screen.getByText("No services yet.")).toBeInTheDocument()
  })
})
