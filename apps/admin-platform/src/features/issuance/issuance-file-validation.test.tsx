import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import IssuanceWizard from "./IssuanceWizard"

describe("IssuanceWizard - file validation", () => {
  afterEach(() => cleanup())

  it("rejects non-PDF files with visible error", async () => {
    const user = userEvent.setup()
    render(<IssuanceWizard />)

    const file = new File(["data"], "photo.png", { type: "image/png" })
    const input = screen.getByLabelText(/Proof of residence/i)
    await user.upload(input, file)

    // submit to trigger validation
    const form = screen.getByRole('form', { name: /Issuance form/i })
    fireEvent.submit(form)

    expect(await screen.findByText(/must be a PDF/i)).toBeInTheDocument()
  })

  it("rejects files larger than 10MB with visible error", async () => {
    const user = userEvent.setup()
    render(<IssuanceWizard />)

    // create ~11MB file
    const largeContent = new Uint8Array(11 * 1024 * 1024).fill(0)
    const largeFile = new File([largeContent], "proof.pdf", { type: "application/pdf" })

    const input = screen.getByLabelText(/Proof of residence/i)
    await user.upload(input, largeFile)

    const form = screen.getByRole('form', { name: /Issuance form/i })
    fireEvent.submit(form)

    expect(await screen.findByText(/exceeds the maximum size of 10 MB/i)).toBeInTheDocument()
  })
})
