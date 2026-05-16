/* Unit tests for verifyQR behavior using stubbed fetch responses. */
// TODO need to review this

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  setVerificationRequestClient,
  verifyQR,
} from "@openlguid/ui/features/verification/api/verificationService"

afterEach(() => {
  setVerificationRequestClient(null)
})

describe("verifyQR", () => {
  it("returns resident details for a valid QR", async () => {
    const requestMock = vi.fn(async (path: string, init?: RequestInit) =>
      new Response(
        JSON.stringify({
          qr_type: "OpenLGUQR",
          id_details: {
            169: {
              uin: "1000",
              4: "Juan Dela Cruz",
              8: "2000-01-01",
              9: "Male",
              7: "Gubat, Diyan",
              11: "juan@example.com",
              12: "09221 924 7284",
              62: ";-;",
              75: "1000",
            },
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    )
    setVerificationRequestClient(requestMock)

    const ret = await verifyQR("mockedAPISuccess")

    expect(ret).toEqual({
      result: "success",
      qr_type: "OpenLGUQR",
      idDetails: {
        uin: "1000",
        full_name: "Juan Dela Cruz",
        dob: "2000-01-01",
        gender: "Male",
        location: "Gubat, Diyan",
        email: "juan@example.com",
        phone: "09221 924 7284",
        face: ";-;",
      },
    })
    expect(requestMock).toHaveBeenCalledWith(
      "/qr/verify",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ qr: "mockedAPISuccess" }),
        credentials: "include",
      })
    )
  })

  it("returns tampered error from API", async () => {
    const requestMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: "error_tampered",
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    )
    setVerificationRequestClient(requestMock)

    const ret = await verifyQR("mockedAPIerror_tampered")

    expect(ret).toEqual({
      result: "error_tampered",
      message: undefined,
    }    )
  })
})