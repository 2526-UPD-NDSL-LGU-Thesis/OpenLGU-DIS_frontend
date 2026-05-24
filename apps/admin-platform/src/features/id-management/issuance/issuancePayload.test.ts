import { describe, expect, it } from "vitest"

import { buildIssuanceSubmissionFormData } from "./issuancePayload"

describe("buildIssuanceSubmissionFormData", () => {
  it("serializes issuance values as flat multipart fields and attaches proof_of_residence", () => {
    const proof = new File(["proof"], "proof.pdf", { type: "application/pdf" })
    const formData = buildIssuanceSubmissionFormData(
      {
        first_name: "Juan",
        middle_name: "",
        last_name: "Dela Cruz",
        suffix_name: "",
        gender: "Male",
        pcn: "",
        dob: "",
        address: "Sample Address",
        email_id: "juan@example.com",
        contact_number: "09170000000",
      },
      proof
    )

    const uploadedProof = formData.get("proof_of_residence")

    expect(formData.get("pcn")).toBe("")
    expect(formData.get("first_name")).toBe("Juan")
    expect(formData.get("middle_name")).toBe("")
    expect(formData.get("last_name")).toBe("Dela Cruz")
    expect(formData.get("suffix_name")).toBe("")
    expect(formData.get("date_of_birth")).toBe("")
    expect(formData.get("gender")).toBe("Male")
    expect(formData.get("address")).toBe("Sample Address")
    expect(formData.get("email_id")).toBe("juan@example.com")
    expect(formData.get("phone_number")).toBe("09170000000")
    expect(uploadedProof).toBeInstanceOf(File)
    expect((uploadedProof as File).name).toBe("proof.pdf")
  })
})
