import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"
import {
  clearIssuancePrefill,
  setIssuancePrefill,
} from "./issuance-prefill-store"
import {
  clearIssuanceSuccessData,
  getIssuanceSuccessData,
} from "./issuance-success-store"

import "./issuance-test-mocks"

import IssuanceWizard from "./IssuanceWizard"

describe("IssuanceWizard", () => {
  beforeEach(() => {
    ;(globalThis as any).__OPENLGU_AUTH_CLIENT = undefined
  })

  afterEach(() => {
    cleanup()
    clearIssuancePrefill()
    clearIssuanceSuccessData()
    ;(globalThis as any).__OPENLGU_AUTH_CLIENT = undefined
  })

  it("uses prefill values from National ID intake when present", async () => {
    setIssuancePrefill({
      first_name: "Juan",
      middle_name: "Santos",
      last_name: "Dela Cruz",
      gender: "Male",
      dob: "2000-01-01",
      address: "Gubat, Diyan",
      contact_number: "09221 924 7284",
      pcn: "PCN-2026-0001",
    })

    render(<IssuanceWizard />)

    expect(await screen.findByLabelText(/First name/i)).toHaveValue("Juan")
    expect(await screen.findByText("PCN-2026-0001")).toBeInTheDocument()
  })

  it("redirects to login when issuance submit is unauthorized", async () => {
    server.use(
      http.post(`*/api/ids/`, () => {
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
    server.use(
      http.post(`*/api/ids/`, async ({ request }) => {
        return HttpResponse.json(
          {
            qr: "QR-2026-0001",
            id_details: {
              pcn: "PCN-2026-0001",
              first_name: "Juan",
              middle_name: "",
              last_name: "Dela Cruz",
              suffix_name: "",
              date_of_birth: "",
              gender: "Male",
              address: "",
              email_id: "",
              phone_number: "09221 924 7284",
              uin: "UIN-2026-0001",
              face_image: "",
            },
          },
          { status: 201 }
        )
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")
    await user.type(screen.getByLabelText(/Gender/i), "Male")
    await user.type(screen.getByLabelText(/Contact number/i), "09221 924 7284")
    const sectorsInput = screen.getByLabelText(/Sectors/i)
    await user.click(sectorsInput)
    await user.click(await screen.findByRole("option", { name: "Health" }))
    await user.click(await screen.findByRole("option", { name: "Education" }))

    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    const input = screen.getByLabelText(/Proof of residence/i)
    await user.upload(input, file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(window.location.pathname).toBe("/id-management/issuance-success")
    })

    expect(getIssuanceSuccessData()).toMatchObject({
      uin: "UIN-2026-0001",
      pcn: "PCN-2026-0001",
      qr: "QR-2026-0001",
      preview: {
        full_name: "Juan Dela Cruz",
        uin: "UIN-2026-0001",
        dob: "",
        gender: "Male",
        address: "",
        phone: "09221 924 7284",
        pcn: "PCN-2026-0001",
      },
    })
  })

  it("navigates to issuance success even when suffix_name is omitted in response", async () => {
    server.use(
      http.post(`*/api/ids/`, async () => {
        return HttpResponse.json(
          {
            qr: "QR-2026-0002",
            id_details: {
              pcn: "PCN-2026-0002",
              first_name: "Juan",
              middle_name: "",
              last_name: "Dela Cruz",
              date_of_birth: "",
              gender: "Male",
              address: "",
              email_id: "",
              phone_number: "09221 924 7284",
              uin: "UIN-2026-0002",
              face_image: "",
            },
          },
          { status: 201 }
        )
      })
    )

    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.type(screen.getByLabelText(/First name/i), "Juan")
    await user.type(screen.getByLabelText(/Last name/i), "Dela Cruz")
    await user.type(screen.getByLabelText(/Gender/i), "Male")
    await user.type(screen.getByLabelText(/Contact number/i), "09221 924 7284")
    const file = new File(["residence"], "proof.pdf", { type: "application/pdf" })
    await user.upload(screen.getByLabelText(/Proof of residence/i), file)

    const form = screen.getByRole("form", { name: /Issuance form/i })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(window.location.pathname).toBe("/id-management/issuance-success")
    })

    expect(getIssuanceSuccessData()).toMatchObject({
      uin: "UIN-2026-0002",
      pcn: "PCN-2026-0002",
      qr: "QR-2026-0002",
    })
  })

  it("shows PCN as a distinct non-interactive applicant summary item", async () => {
    render(<IssuanceWizard />)

    expect(screen.getByText("PCN")).toBeInTheDocument()
    expect(screen.getByText("Empty")).toBeInTheDocument()
    expect(screen.queryByLabelText(/PCN/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Suffix name/i)).toBeInTheDocument()
  })

  it("cancels issuance and returns to the dashboard", async () => {
    const user = userEvent.setup()
    render(<IssuanceWizard />)

    await user.click(screen.getByRole("button", { name: "Cancel issuance" }))
    await user.click(screen.getByRole("button", { name: "Yes, cancel" }))

    await waitFor(() => {
      expect(window.location.pathname).toBe("/id-management")
    })
  })

  it("shows inline validation errors when issuance submit is rejected", async () => {
    server.use(
      http.post(`*/api/ids/`, () => {
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
    expect((await screen.findAllByText("Proof of residence must be a PDF.")).length).toBeGreaterThan(0)
  })

  it("shows a retryable message when issuance submit hits a server error", async () => {
    server.use(
      http.post(`*/api/ids/`, () => {
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
