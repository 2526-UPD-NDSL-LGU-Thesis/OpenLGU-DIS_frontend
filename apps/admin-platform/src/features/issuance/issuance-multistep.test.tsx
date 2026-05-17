import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import IssuanceWizard from "./IssuanceWizard"

describe("IssuanceWizard - multistep flow", () => {
  afterEach(() => cleanup())

  it("navigates steps: applicant -> sectors+document -> review and submit", async () => {
    const user = userEvent.setup()
    render(<IssuanceWizard />)

    // Step 1: applicant fields
    expect(await screen.findByLabelText(/First name/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Last name/i)).toBeInTheDocument()

    expect(await screen.findByLabelText(/Sectors/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Proof of residence/i)).toBeInTheDocument()

    expect(await screen.findByText(/^Submit$/i)).toBeInTheDocument()
  })
})
