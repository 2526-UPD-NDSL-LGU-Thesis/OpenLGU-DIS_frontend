import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"

import IssuanceWizard from "./IssuanceWizard"

describe("IssuanceWizard", () => {
  afterEach(() => cleanup())

  it("submits applicant data and calls issuance endpoint", async () => {
    let called = false
    server.use(
      http.post(`/api/ids/issue`, () => {
        called = true
        return HttpResponse.json({ id: "issued-1" }, { status: 201 })
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    const input = screen.getByLabelText(/Proof of residence/i)
    await user.upload(input, file)

    const form = screen.getByRole('form', { name: /Issuance form/i })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(called).toBe(true)
    })
  })

  it("submits a structured payload, uploads the proof, and shows the issued UIN", async () => {
    server.use(
      http.post(`/api/ids/issue`, () =>
        HttpResponse.json(
          {
            ok: true,
            uin: "UIN-2026-0001",
            pcn: "PCN-2026-0001",
            sector: ["health", "education"],
          },
          { status: 201 }
        )
      )
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")
    const sectorsInput = screen.getByLabelText(/Sectors/i)
    await user.click(sectorsInput)
    await user.click(await screen.findByRole("option", { name: "Health" }))
    await user.click(await screen.findByRole("option", { name: "Education" }))

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    const input = screen.getByLabelText(/Proof of residence/i)
    await user.upload(input, file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    expect(await screen.findByText(/UIN-2026-0001/)).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: /Back to dashboard/i })).toBeInTheDocument()
  })
})
