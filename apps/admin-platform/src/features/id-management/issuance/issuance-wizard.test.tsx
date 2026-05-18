import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"

import "./issuance-test-mocks"

import IssuanceWizard from "./IssuanceWizard"

describe("IssuanceWizard", () => {
  afterEach(() => cleanup())

  it("redirects to login when issuance submit is unauthorized", async () => {
    server.use(
      http.post(`/api/ids/issue`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    await user.upload(screen.getByLabelText(/Proof of residence/i), file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login")
    })
  })

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

  it("shows PCN as a distinct non-interactive applicant summary item", async () => {
    render(<IssuanceWizard />)

    expect(screen.getByText("PCN")).toBeInTheDocument()
    expect(screen.getByText("Empty")).toBeInTheDocument()
    expect(screen.queryByLabelText(/PCN/i)).not.toBeInTheDocument()
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
    await user.type(screen.getByLabelText(/Gender/i), "Male")
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
    expect(await screen.findByText(/Cached reprint available for 1 hour/i)).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: /Clear cached reprint/i })).toBeInTheDocument()
    expect(await screen.findByTitle("Physical LGU ID preview")).toBeInTheDocument()
  })

  it("clears the cached reprint after confirmation", async () => {
    server.use(
      http.post(`/api/ids/issue`, () =>
        HttpResponse.json(
          {
            ok: true,
            uin: "UIN-2026-0001",
            pcn: "PCN-2026-0001",
          },
          { status: 201 }
        )
      )
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")
    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    await user.upload(screen.getByLabelText(/Proof of residence/i), file)

    fireEvent.submit(screen.getByRole("form", { name: /Issuance form/i }))

    await user.click(await screen.findByRole("button", { name: /Clear cached reprint/i }))
    expect(await screen.findByText(/Clear cached reprint\?/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^Clear cache$/i }))

    expect(screen.queryByText(/Cached reprint available for 1 hour/i)).not.toBeInTheDocument()
  })

  it("shows inline validation errors when issuance submit is rejected", async () => {
    server.use(
      http.post(`/api/ids/issue`, () => {
        return HttpResponse.json(
          {
            detail: "Validation error",
            errors: {
              first_name: "First name is required.",
              proof: "Proof of residence must be a PDF.",
            },
          },
          { status: 400 }
        )
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    await user.upload(screen.getByLabelText(/Proof of residence/i), file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    expect(await screen.findByText("First name is required.")).toBeInTheDocument()
    expect(await screen.findByText("Proof of residence must be a PDF.")).toBeInTheDocument()
  })

  it("shows a retryable message when issuance submit hits a server error", async () => {
    server.use(
      http.post(`/api/ids/issue`, () => {
        return HttpResponse.json({ detail: "Server error" }, { status: 500 })
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    await user.upload(screen.getByLabelText(/Proof of residence/i), file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    expect(await screen.findByText(/Please try again/i)).toBeInTheDocument()
  })
})
