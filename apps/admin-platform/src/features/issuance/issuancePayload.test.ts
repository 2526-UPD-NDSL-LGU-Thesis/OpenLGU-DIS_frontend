import { describe, expect, it } from "vitest"

import { buildIssuanceSubmissionFormData } from "./issuancePayload"

describe("buildIssuanceSubmissionFormData", () => {
  it("serializes issuance values in payload and attaches proof file", () => {
    const proof = new File(["proof"], "proof.pdf", { type: "application/pdf" })
    const formData = buildIssuanceSubmissionFormData(
      {
        first_name: "Juan",
        middle_name: "",
        last_name: "Dela Cruz",
        pcn: "",
        dob: "",
        address: "Sample Address",
        contact_number: "09170000000",
        sectors: ["health", "education"],
      },
      proof
    )

    const payload = JSON.parse(String(formData.get("payload")))
    const uploadedProof = formData.get("proof")

    expect(payload).toEqual({
      first_name: "Juan",
      middle_name: "",
      last_name: "Dela Cruz",
      pcn: "",
      dob: "",
      address: "Sample Address",
      contact_number: "09170000000",
      sectors: ["health", "education"],
    })
    expect(uploadedProof).toBeInstanceOf(File)
    expect((uploadedProof as File).name).toBe("proof.pdf")
  })
})
