/* Tests for shared mock verification data generation utility. 
TODO need to review this
*/

import { describe, expect, it } from "vitest"

import {
  getMockApiResponseByRawQR,
  getMockVerificationResult,
} from "#/tests/utility/mockVerificationData.ts"

describe("mockVerificationData", () => {
  it("returns fixed success verification result", () => {
    const result = getMockVerificationResult("fixed-success")

    expect(result.result).toBe("success")
    expect(result.idDetails?.issuerType).toBe("LGU")
  })

  it("returns mocked API tampered response for known raw QR", () => {
    const response = getMockApiResponseByRawQR("mockedAPIerror_tampered")

    expect(response).toEqual({
      status: 400,
      body: {
        error: "error_tampered",
      },
    })
  })
})
